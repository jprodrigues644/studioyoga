package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests - TeacherService")
class TeacherServiceTest {

    // ==================== MOCKS ====================
    
    @Mock
    private TeacherRepository teacherRepository;

    // ==================== SERVICE TESTÉ ====================
    
    @InjectMocks
    private TeacherService teacherService;

    // ==================== DONNÉES DE TEST ====================
    
    private Teacher teacher1;
    private Teacher teacher2;
    private Teacher teacher3;

    @BeforeEach
    void setUp() {
        // Créer des professeurs de test
        teacher1 = Teacher.builder()
                .id(1L)
                .firstName("Margot")
                .lastName("DELAHAYE")
                .createdAt(LocalDateTime.now().minusMonths(6))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        teacher2 = Teacher.builder()
                .id(2L)
                .firstName("Hélène")
                .lastName("THIERCELIN")
                .createdAt(LocalDateTime.now().minusMonths(3))
                .updatedAt(LocalDateTime.now())
                .build();

        teacher3 = Teacher.builder()
                .id(3L)
                .firstName("Pierre")
                .lastName("DUPONT")
                .createdAt(LocalDateTime.now().minusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== TESTS findAll() ====================

    @Test
    @DisplayName("findAll - Should return all teachers")
    void testFindAll_ShouldReturnAllTeachers() {
        // GIVEN
        List<Teacher> expectedTeachers = Arrays.asList(teacher1, teacher2, teacher3);
        when(teacherRepository.findAll()).thenReturn(expectedTeachers);

        // WHEN
        List<Teacher> actualTeachers = teacherService.findAll();

        // THEN
        assertThat(actualTeachers).isNotNull();
        assertThat(actualTeachers).hasSize(3);
        assertThat(actualTeachers).containsExactly(teacher1, teacher2, teacher3);
        
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Should return empty list when no teachers exist")
    void testFindAll_WhenNoTeachers_ShouldReturnEmptyList() {
        // GIVEN
        when(teacherRepository.findAll()).thenReturn(Collections.emptyList());

        // WHEN
        List<Teacher> actualTeachers = teacherService.findAll();

        // THEN
        assertThat(actualTeachers).isNotNull();
        assertThat(actualTeachers).isEmpty();
        
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Should return single teacher when only one exists")
    void testFindAll_WithSingleTeacher_ShouldReturnListWithOneElement() {
        // GIVEN
        List<Teacher> singleTeacherList = Collections.singletonList(teacher1);
        when(teacherRepository.findAll()).thenReturn(singleTeacherList);

        // WHEN
        List<Teacher> actualTeachers = teacherService.findAll();

        // THEN
        assertThat(actualTeachers).hasSize(1);
        assertThat(actualTeachers.get(0)).isEqualTo(teacher1);
        assertThat(actualTeachers.get(0).getFirstName()).isEqualTo("Margot");
        assertThat(actualTeachers.get(0).getLastName()).isEqualTo("DELAHAYE");
        
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Should call repository exactly once")
    void testFindAll_ShouldCallRepositoryOnce() {
        // GIVEN
        when(teacherRepository.findAll()).thenReturn(Collections.emptyList());

        // WHEN
        teacherService.findAll();

        // THEN
        verify(teacherRepository, times(1)).findAll();
        verifyNoMoreInteractions(teacherRepository);
    }

    // ==================== TESTS findById() ====================

    @Test
    @DisplayName("findById - Should return teacher when id exists")
    void testFindById_WithValidId_ShouldReturnTeacher() {
        // GIVEN
        Long teacherId = 1L;
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(teacher1));

        // WHEN
        Teacher foundTeacher = teacherService.findById(teacherId);

        // THEN
        assertThat(foundTeacher).isNotNull();
        assertThat(foundTeacher.getId()).isEqualTo(1L);
        assertThat(foundTeacher.getFirstName()).isEqualTo("Margot");
        assertThat(foundTeacher.getLastName()).isEqualTo("DELAHAYE");
        
        verify(teacherRepository, times(1)).findById(teacherId);
    }

    @Test
    @DisplayName("findById - Should throw NotFoundException when id does not exist")
    void testFindById_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        Long nonExistentId = 999L;
        when(teacherRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> teacherService.findById(nonExistentId))
                .isInstanceOf(NotFoundException.class);

        verify(teacherRepository, times(1)).findById(nonExistentId);
    }

    @Test
    @DisplayName("findById - Should return correct teacher for each different id")
    void testFindById_WithDifferentIds_ShouldReturnCorrectTeachers() {
        // GIVEN
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher1));
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(teacher2));
        when(teacherRepository.findById(3L)).thenReturn(Optional.of(teacher3));

        // WHEN
        Teacher found1 = teacherService.findById(1L);
        Teacher found2 = teacherService.findById(2L);
        Teacher found3 = teacherService.findById(3L);

        // THEN
        assertThat(found1.getFirstName()).isEqualTo("Margot");
        assertThat(found2.getFirstName()).isEqualTo("Hélène");
        assertThat(found3.getFirstName()).isEqualTo("Pierre");

        verify(teacherRepository, times(1)).findById(1L);
        verify(teacherRepository, times(1)).findById(2L);
        verify(teacherRepository, times(1)).findById(3L);
    }

    @Test
    @DisplayName("findById - Should throw NotFoundException when id is null")
    void testFindById_WithNullId_ShouldThrowNotFoundException() {
        // GIVEN
        when(teacherRepository.findById(null)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> teacherService.findById(null))
                .isInstanceOf(NotFoundException.class);

        verify(teacherRepository, times(1)).findById(null);
    }

    @Test
    @DisplayName("findById - Should call repository exactly once")
    void testFindById_ShouldCallRepositoryOnce() {
        // GIVEN
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.of(teacher1));

        // WHEN
        teacherService.findById(1L);

        // THEN
        verify(teacherRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(teacherRepository);
    }

    @Test
    @DisplayName("findById - Should preserve all teacher properties")
    void testFindById_ShouldPreserveAllProperties() {
        // GIVEN
        LocalDateTime createdDate = LocalDateTime.of(2023, 6, 15, 10, 30);
        LocalDateTime updatedDate = LocalDateTime.of(2024, 1, 20, 14, 45);
        
        Teacher teacherWithDates = Teacher.builder()
                .id(10L)
                .firstName("Marie")
                .lastName("MARTIN")
                .createdAt(createdDate)
                .updatedAt(updatedDate)
                .build();

        when(teacherRepository.findById(10L)).thenReturn(Optional.of(teacherWithDates));

        // WHEN
        Teacher found = teacherService.findById(10L);

        // THEN
        assertThat(found.getId()).isEqualTo(10L);
        assertThat(found.getFirstName()).isEqualTo("Marie");
        assertThat(found.getLastName()).isEqualTo("MARTIN");
        assertThat(found.getCreatedAt()).isEqualTo(createdDate);
        assertThat(found.getUpdatedAt()).isEqualTo(updatedDate);
    }
}