package com.example.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.PasswordResetToken;
import com.example.helpdesk.model.User;

import jakarta.persistence.LockModeType;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByToken(String token);
    List<PasswordResetToken> findAllByUserAndUsedFalse(User user);
}
