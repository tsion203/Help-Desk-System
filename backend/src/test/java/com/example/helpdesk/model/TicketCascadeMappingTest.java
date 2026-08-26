package com.example.helpdesk.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.util.List;

import org.junit.jupiter.api.Test;

import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

class TicketCascadeMappingTest {

    @Test
    void ticketOwnedRecordsAreRemovedWithTicket() throws NoSuchFieldException {
        for (String fieldName : List.of(
                "comments",
                "attachments",
                "statusHistory",
                "assignmentHistory",
                "notifications")) {
            Field field = Ticket.class.getDeclaredField(fieldName);
            OneToMany relationship = field.getAnnotation(OneToMany.class);

            assertEquals("ticket", relationship.mappedBy(), fieldName);
            assertTrue(List.of(relationship.cascade()).contains(CascadeType.REMOVE), fieldName);
            assertTrue(relationship.orphanRemoval(), fieldName);
        }
    }

    @Test
    void sharedReferencesAreNotConfiguredForCascadeRemoval() throws NoSuchFieldException {
        for (String fieldName : List.of("createdBy", "assignedTo", "category")) {
            Field field = Ticket.class.getDeclaredField(fieldName);
            ManyToOne relationship = field.getAnnotation(ManyToOne.class);
            assertTrue(!List.of(relationship.cascade()).contains(CascadeType.REMOVE), fieldName);
        }
    }
}
