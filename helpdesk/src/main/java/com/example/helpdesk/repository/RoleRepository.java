package com.example.helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
}
