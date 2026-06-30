package com.example.helpdesk;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.example.helpdesk.model.Department;
import com.example.helpdesk.model.Role;
import com.example.helpdesk.model.User;
import com.example.helpdesk.repository.DepartmentRepository;
import com.example.helpdesk.repository.RoleRepository;
import com.example.helpdesk.repository.UserRepository;
                                                  
@SpringBootApplication
public class HelpDeskApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    public static void main(String[] args) {
        SpringApplication.run(HelpDeskApplication.class, args);
    }

    @Override
    public void run(String... args) {

        Department department = new Department();
        department.setName("IT");
        department.setDescription("Information Technology");
        department = departmentRepository.save(department);

        Role role = new Role();
        role.setName("EMPLOYEE");
        role.setDescription("Regular employee");
        role = roleRepository.save(role);

        User user = new User();
        user.setEmail("john@example.com");
        user.setEmployeeId("EMP001");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPhoneNumber("0912345678");
        user.setActive(true);

        user.setDepartment(department);
        user.setRoles(List.of(role));

        userRepository.save(user);

        System.out.println("User saved successfully!");
    }
}