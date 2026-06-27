package com.example.helpdesk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}