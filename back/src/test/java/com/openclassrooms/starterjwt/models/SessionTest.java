package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SessionTest {

    @Test
    public void testSessionBuilder() {
        // ARRANGE
        Date date = new Date();

        Teacher teacher = Teacher.builder()
                .id(1L)
                .build();

        User user = User.builder()
                .id(1L)
                .email("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        // ACT
        Session session = Session.builder()
                .id(1L)
                .name("Yoga Morning")
                .date(date)
                .description("Relaxing yoga session")
                .teacher(teacher)
                .users(List.of(user))
                .build();

        // ASSERT
        assertNotNull(session);
        assertEquals(1L, session.getId());
        assertEquals("Yoga Morning", session.getName());
        assertEquals(date, session.getDate());
        assertEquals("Relaxing yoga session", session.getDescription());
        assertEquals(teacher, session.getTeacher());
        assertEquals(1, session.getUsers().size());
    }

    @Test
    public void testSessionEqualsAndHashCode() {
        // ARRANGE
        Session session1 = Session.builder()
                .id(1L)
                .name("Yoga")
                .build();

        Session session2 = Session.builder()
                .id(1L)
                .name("Yoga Advanced")
                .build();

        // ASSERT
        assertEquals(session1, session2);
        assertEquals(session1.hashCode(), session2.hashCode());
    }
}
