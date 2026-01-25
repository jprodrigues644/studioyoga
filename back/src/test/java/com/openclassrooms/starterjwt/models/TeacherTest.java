package com.openclassrooms.starterjwt.models;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class TeacherTest {

    @Test
    void newTeacher_ShouldInitializeFieldsCorrectly() {
        // Arrange
        Teacher teacher = new Teacher();
        teacher.setFirstName("Jean");
        teacher.setLastName("Dupont");

        // Act & Assert
        assertNull(teacher.getId());
        assertEquals("Jean", teacher.getFirstName());
        assertEquals("Dupont", teacher.getLastName());
        assertNull(teacher.getCreatedAt());
        assertNull(teacher.getUpdatedAt());
    }

    @Test
    void teacherBuilder_ShouldInitializeFieldsCorrectly() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher = Teacher.builder()
                .id(1L)
                .firstName("Jean")
                .lastName("Dupont")
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Act & Assert
        assertEquals(1L, teacher.getId());
        assertEquals("Jean", teacher.getFirstName());
        assertEquals("Dupont", teacher.getLastName());
        assertEquals(now, teacher.getCreatedAt());
        assertEquals(now, teacher.getUpdatedAt());
    }

    @Test
    void teacherAllArgsConstructor_ShouldInitializeFieldsCorrectly() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher = new Teacher(1L, "Dupont", "Jean", now, now);

        // Act & Assert
        assertEquals(1L, teacher.getId());
        assertEquals("Jean", teacher.getFirstName());
        assertEquals("Dupont", teacher.getLastName());
        assertEquals(now, teacher.getCreatedAt());
        assertEquals(now, teacher.getUpdatedAt());
    }

    @Test
    void equalsAndHashCode_ShouldWorkCorrectly() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher1 = new Teacher(1L, "Dupont", "Jean", now, now);
        Teacher teacher2 = new Teacher(1L, "Martin", "Pierre", now, now);

        // Act & Assert
        assertEquals(teacher1, teacher2);
        assertEquals(teacher1.hashCode(), teacher2.hashCode());
    }

    @Test
    void equals_ShouldReturnFalseForDifferentIds() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher1 = new Teacher(1L, "Dupont", "Jean", now, now);
        Teacher teacher2 = new Teacher(2L, "Dupont", "Jean", now, now);

        // Act & Assert
        assertNotEquals(teacher1, teacher2);
    }

    @Test
    void toString_ShouldContainAllFields() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher = new Teacher(1L, "Dupont", "Jean", now, now);

        // Act
        String teacherString = teacher.toString();

        // Assert
        assertTrue(teacherString.contains("id=1"));
        assertTrue(teacherString.contains("lastName=Dupont"));
        assertTrue(teacherString.contains("firstName=Jean"));
    }
}
