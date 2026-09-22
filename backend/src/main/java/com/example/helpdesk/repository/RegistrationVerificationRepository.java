package com.example.helpdesk.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import com.example.helpdesk.model.RegistrationVerification;

public interface RegistrationVerificationRepository extends JpaRepository<RegistrationVerification, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from RegistrationVerification v where v.email = :email")
    Optional<RegistrationVerification> lockByEmail(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from RegistrationVerification v where v.id = :id")
    Optional<RegistrationVerification> lockById(@Param("id") String id);
}
