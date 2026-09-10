package com.example.helpdesk.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.helpdesk.model.*;
import com.example.helpdesk.repository.*;
import com.example.helpdesk.service.EmailService;
import com.example.helpdesk.service.NotificationService;

@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class TicketSortingTest {
    @Autowired TicketRepository tickets;
    @Autowired jakarta.persistence.EntityManager em;

    @AfterEach
    void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @ParameterizedTest
    @CsvSource({"ADMIN,all", "SUPERVISOR,all", "EMPLOYEE,all", "SUPPORT_OFFICER,all",
            "EMPLOYEE,created", "SUPPORT_OFFICER,assigned"})
    void sortsFilteredPagesInBothDirections(String role, String endpoint) {
        User user = new User();
        user.setId(42L);
        UserRepository users = mock(UserRepository.class);
        when(users.findByEmail("sort@example.com")).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "sort@example.com", "unused", List.of(new SimpleGrantedAuthority("ROLE_" + role))));
        TicketServiceImpl service = new TicketServiceImpl(tickets, users, mock(TicketCategoryRepository.class),
                mock(TicketAssignmentHistoryRepository.class), mock(TicketStatusHistoryRepository.class),
                mock(NotificationService.class), mock(EmailService.class));

        // Persist real owners so the existing visibility specifications execute in the database.
        User owner = new User();
        owner.setEmail("owner@example.com"); owner.setPassword("unused"); owner.setEmployeeId("SORT");
        owner.setFirstName("Sort"); owner.setLastName("Test"); owner.setPhoneNumber("123");
        em.persist(owner);
        user.setId(owner.getId());
        TicketCategory category = new TicketCategory();
        category.setName("Hardware"); category.setDescription("Hardware"); em.persist(category);
        List<Long> expected = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            Ticket ticket = new Ticket();
            ticket.setTicketNumber("SORT-" + i); ticket.setSubject("Sort"); ticket.setDescription("Sort");
            ticket.setStatus(i == 6 ? TicketStatus.CLOSED : TicketStatus.OPEN);
            ticket.setPriority(i == 7 ? TicketPriority.LOW : TicketPriority.HIGH);
            ticket.setCategory(i == 8 ? null : category); ticket.setCreatedBy(owner); ticket.setAssignedTo(owner);
            ticket.setUpdatedAt(LocalDateTime.of(2026, 1, 1, 12, 0).plusHours(i / 3));
            em.persist(ticket);
            if (i < 6) expected.add(ticket.getId());
        }
        em.flush();
        for (Sort.Direction direction : Sort.Direction.values()) {
            List<Long> actual = new ArrayList<>();
            for (int page = 0; page < 3; page++) {
                var request = PageRequest.of(page, 2, Sort.by(direction, "updatedAt"));
                var result = switch (endpoint) {
                    case "created" -> service.getCreatedTicketsForCurrentUser(TicketStatus.OPEN, "Hardware", TicketPriority.HIGH, request);
                    case "assigned" -> service.getAssignedTicketsForCurrentUser(TicketStatus.OPEN, "Hardware", TicketPriority.HIGH, request);
                    default -> service.getAll(TicketStatus.OPEN, "Hardware", TicketPriority.HIGH, request);
                };
                assertThat(result.getTotalElements()).isEqualTo(6);
                assertThat(result.getTotalPages()).isEqualTo(3);
                result.forEach(ticket -> actual.add(ticket.getId()));
            }
            assertThat(actual).containsExactlyElementsOf(direction.isAscending() ? expected : expected.reversed());
        }
    }
}
