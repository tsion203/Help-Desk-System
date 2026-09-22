package com.example.helpdesk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.web.FilterChainProxy;
import com.example.helpdesk.model.*;
import com.example.helpdesk.repository.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:registration;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false"
})
class RegistrationVerificationIntegrationTest {
    @Autowired WebApplicationContext context;
    @Autowired FilterChainProxy securityFilter;
    @Autowired UserRepository users;
    @Autowired DepartmentRepository departments;
    @Autowired RoleRepository roles;
    @Autowired RegistrationVerificationRepository verifications;
    @Autowired PasswordEncoder encoder;
    @MockitoBean JavaMailSender mail;
    final ObjectMapper mapper = new ObjectMapper();
    MockMvc mvc;
    String email;
    Long departmentId;

    @BeforeEach void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(securityFilter).build();
        email = UUID.randomUUID() + "@example.test";
        Department department = new Department();
        department.setName(UUID.randomUUID().toString());
        department.setDescription("Test department");
        departmentId = departments.save(department).getId();
        if (roles.findAll().stream().noneMatch(role -> "EMPLOYEE".equals(role.getName()))) {
            Role role = new Role(); role.setName("EMPLOYEE"); role.setDescription("Employee"); roles.save(role);
        }
    }

    String registrationBody() {
        return """
            {"email":"%s","password":"SecurePassword123!","employeeId":"%s",
             "firstName":"Test","lastName":"Person","phoneNumber":"12345678",
             "departmentId":%d,"active":true,"roleIds":[]}
            """.formatted(email, UUID.randomUUID(), departmentId);
    }
    JsonNode start() throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registrationBody()))
            .andExpect(status().isAccepted()).andExpect(jsonPath("token").doesNotExist())
            .andExpect(jsonPath("code").doesNotExist()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(body);
    }
    String emailedCode() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mail, atLeastOnce()).send(captor.capture());
        SimpleMailMessage message = captor.getAllValues().getLast();
        assertThat(message.getTo()).containsExactly(email);
        var matcher = Pattern.compile("\\b[0-9]{6}\\b").matcher(message.getText());
        assertThat(matcher.find()).isTrue();
        return matcher.group();
    }
    String verificationBody(String id, String code) {
        return "{\"registrationId\":\"" + id + "\",\"code\":\"" + code + "\"}";
    }
    void allowResend(String id) {
        var pending = verifications.findById(id).orElseThrow();
        pending.setLastSentAt(Instant.now().minusSeconds(61));
        verifications.save(pending);
    }

    @Test void registrationEmailVerificationCreationAndLogin() throws Exception {
        var challenge = start();
        String id = challenge.get("registrationId").asText();
        String code = emailedCode();
        assertThat(users.existsByEmailIgnoreCase(email)).isFalse();
        var pending = verifications.findById(id).orElseThrow();
        assertThat(encoder.matches(code, pending.getCodeHash())).isTrue();
        assertThat(pending.getCodeHash()).isNotEqualTo(code);
        assertThat(pending.getExpiresAt()).isBetween(Instant.now().plusSeconds(590), Instant.now().plusSeconds(601));
        String login = "{\"email\":\"" + email + "\",\"password\":\"SecurePassword123!\"}";
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON).content(verificationBody(id, code)))
            .andExpect(status().isCreated()).andExpect(jsonPath("token").isNotEmpty());
        assertThat(users.findByEmail(email).orElseThrow().isActive()).isTrue();
        assertThat(verifications.findById(id).orElseThrow().getPasswordHash()).isNull();
        mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON).content(verificationBody(id, code)))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("message").value("This verification code has already been used. Please sign in."));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
            .andExpect(status().isOk()).andExpect(jsonPath("token").isNotEmpty());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registrationBody()))
            .andExpect(status().isConflict()).andExpect(jsonPath("message").value("An account with this email already exists."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Employee", "ROLE_EMPLOYEE", " role-employee "})
    void registrationAcceptsEmployeeRoleNamesSupportedByLogin(String roleName) throws Exception {
        Role role = roles.findAll().stream().filter(item -> "EMPLOYEE".equals(item.getName())).findFirst().orElseThrow();
        role.setName(roleName);
        roles.saveAndFlush(role);
        try {
            String id = start().get("registrationId").asText();
            mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON)
                    .content(verificationBody(id, emailedCode())))
                .andExpect(status().isCreated()).andExpect(jsonPath("role").value("EMPLOYEE"));
        } finally {
            role.setName("EMPLOYEE");
            roles.saveAndFlush(role);
        }
    }

    @Test void incorrectAttemptsPersistAndResendIsThrottled() throws Exception {
        String id = start().get("registrationId").asText();
        String code = emailedCode();
        String wrong = code.equals("000000") ? "111111" : "000000";
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON).content(verificationBody(id, wrong)))
                .andExpect(status().isBadRequest());
        }
        assertThat(verifications.findById(id).orElseThrow().getFailedAttempts()).isEqualTo(5);
        mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON).content(verificationBody(id, code)))
            .andExpect(status().isTooManyRequests());
        mvc.perform(post("/api/auth/register/resend").contentType(MediaType.APPLICATION_JSON).content("{\"registrationId\":\"" + id + "\"}"))
            .andExpect(status().isTooManyRequests());
        allowResend(id);
        mvc.perform(post("/api/auth/register/resend").contentType(MediaType.APPLICATION_JSON).content("{\"registrationId\":\"" + id + "\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("code").doesNotExist());
        var pending = verifications.findById(id).orElseThrow();
        assertThat(pending.getFailedAttempts()).isZero();
        assertThat(encoder.matches(emailedCode(), pending.getCodeHash())).isTrue();
        pending.setSendCount(5); pending.setLastSentAt(Instant.now().minusSeconds(61)); verifications.save(pending);
        mvc.perform(post("/api/auth/register/resend").contentType(MediaType.APPLICATION_JSON).content("{\"registrationId\":\"" + id + "\"}"))
            .andExpect(status().isTooManyRequests());
        assertThat(users.existsByEmailIgnoreCase(email)).isFalse();
    }

    @Test void expiredCodeCannotCreateUser() throws Exception {
        String id = start().get("registrationId").asText();
        String code = emailedCode();
        var pending = verifications.findById(id).orElseThrow();
        pending.setExpiresAt(Instant.now().minusSeconds(1)); verifications.save(pending);
        mvc.perform(post("/api/auth/register/verify").contentType(MediaType.APPLICATION_JSON).content(verificationBody(id, code)))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("message").value("This verification code has expired. Please request a new code."));
        assertThat(users.existsByEmailIgnoreCase(email)).isFalse();
    }

    @Test void mailFailureRollsBackPendingRegistration() throws Exception {
        doThrow(new MailSendException("Test delivery failure")).when(mail).send(any(SimpleMailMessage.class));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registrationBody()))
            .andExpect(status().isServiceUnavailable());
        assertThat(verifications.findAll()).noneMatch(item -> email.equals(item.getEmail()));
        assertThat(users.existsByEmailIgnoreCase(email)).isFalse();
    }
}
