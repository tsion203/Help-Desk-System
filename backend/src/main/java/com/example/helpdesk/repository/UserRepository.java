package com.example.helpdesk.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.helpdesk.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmployeeIdAndIdNot(String employeeId, Long id);

    @Query(value = """
            SELECT u.id AS id,
                   u.first_name AS firstName,
                   u.last_name AS lastName,
                   COUNT(t.id) AS activeTicketCount
            FROM users u
            LEFT JOIN tickets t ON t.assigned_to = u.id
                AND t.status NOT IN ('RESOLVED', 'CLOSED')
            WHERE u.active = 1
              AND u.id <> :requesterId
              AND EXISTS (
                  SELECT 1 FROM users_roles ur
                  JOIN roles r ON r.id = ur.role_id
                  WHERE ur.user_id = u.id
                    AND REPLACE(REPLACE(REPLACE(UPPER(TRIM(r.name)), 'ROLE_', ''), ' ', '_'), '-', '_') = 'SUPPORT_OFFICER'
              )
            GROUP BY u.id, u.first_name, u.last_name
            ORDER BY u.first_name, u.last_name
            """, nativeQuery = true)
    List<TicketAssigneeOptionProjection> findTicketAssigneeOptionsExcludingRequester(
            @Param("requesterId") Long requesterId);
}
