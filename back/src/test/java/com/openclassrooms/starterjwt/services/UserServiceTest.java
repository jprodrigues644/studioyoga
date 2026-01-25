package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests - UserService")
class UserServiceTest {

    // ==================== MOCKS ====================
    
    @Mock
    private UserRepository userRepository;

    // ==================== SERVICE TESTÉ ====================
    
    @InjectMocks
    private UserService userService;

    // ==================== DONNÉES DE TEST ====================
    
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== TESTS findById() ====================

    @Test
    @DisplayName("findById - Should return user when id exists")
    void testFindById_WithValidId_ShouldReturnUser() {
        // GIVEN
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // WHEN
        User foundUser = userService.findById(userId);

        // THEN
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(1L);
        assertThat(foundUser.getEmail()).isEqualTo("user@test.com");
        assertThat(foundUser.getFirstName()).isEqualTo("John");
        assertThat(foundUser.getLastName()).isEqualTo("Doe");
        
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("findById - Should throw NotFoundException when user does not exist")
    void testFindById_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        Long nonExistentId = 999L;
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> userService.findById(nonExistentId))
                .isInstanceOf(NotFoundException.class);

        verify(userRepository, times(1)).findById(nonExistentId);
    }

    @Test
    @DisplayName("findById - Should preserve all user properties")
    void testFindById_ShouldPreserveAllUserProperties() {
        // GIVEN
        User adminUser = User.builder()
                .id(2L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminPassword")
                .admin(true)
                .createdAt(LocalDateTime.now().minusDays(30))
                .updatedAt(LocalDateTime.now())
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

        // WHEN
        User found = userService.findById(2L);

        // THEN
        assertThat(found.getId()).isEqualTo(2L);
        assertThat(found.getEmail()).isEqualTo("admin@test.com");
        assertThat(found.isAdmin()).isTrue();
        assertThat(found.getPassword()).isEqualTo("adminPassword");
    }

    @Test
    @DisplayName("findById - Should call repository exactly once")
    void testFindById_ShouldCallRepositoryOnce() {
        // GIVEN
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

        // WHEN
        userService.findById(1L);

        // THEN
        verify(userRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(userRepository);
    }

    // ==================== TESTS delete() ====================

    @Test
    @DisplayName("delete - Should delete user when id exists")
    void testDelete_WithValidId_ShouldDeleteUser() {
        // GIVEN
        Long userId = 1L;
        when(userRepository.existsById(userId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(userId);

        // WHEN
        userService.delete(userId);

        // THEN
        verify(userRepository, times(1)).existsById(userId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    @DisplayName("delete - Should throw NotFoundException when user does not exist")
    void testDelete_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        Long nonExistentId = 999L;
        when(userRepository.existsById(nonExistentId)).thenReturn(false);

        // WHEN & THEN
        assertThatThrownBy(() -> userService.delete(nonExistentId))
                .isInstanceOf(NotFoundException.class);

        verify(userRepository, times(1)).existsById(nonExistentId);
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("delete - Should check existence before deleting")
    void testDelete_ShouldCheckExistenceBeforeDeleting() {
        // GIVEN
        Long userId = 1L;
        when(userRepository.existsById(userId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(userId);

        // WHEN
        userService.delete(userId);

        // THEN - Vérifier l'ordre d'exécution
        var inOrder = inOrder(userRepository);
        inOrder.verify(userRepository).existsById(userId);
        inOrder.verify(userRepository).deleteById(userId);
    }

    @Test
    @DisplayName("delete - Should not call deleteById when user does not exist")
    void testDelete_WhenUserDoesNotExist_ShouldNotCallDeleteById() {
        // GIVEN
        when(userRepository.existsById(anyLong())).thenReturn(false);

        // WHEN & THEN
        assertThatThrownBy(() -> userService.delete(1L))
                .isInstanceOf(NotFoundException.class);

        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("delete - Should call deleteById with correct id")
    void testDelete_ShouldCallDeleteByIdWithCorrectId() {
        // GIVEN
        Long specificId = 42L;
        when(userRepository.existsById(specificId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(specificId);

        // WHEN
        userService.delete(specificId);

        // THEN
        verify(userRepository).deleteById(specificId);
    }

    @Test
    @DisplayName("delete - Should handle multiple different ids")
    void testDelete_WithDifferentIds_ShouldDeleteCorrectly() {
        // GIVEN
        when(userRepository.existsById(1L)).thenReturn(true);
        when(userRepository.existsById(2L)).thenReturn(true);
        when(userRepository.existsById(3L)).thenReturn(false);

        // WHEN
        userService.delete(1L);
        userService.delete(2L);

        // THEN
        verify(userRepository, times(1)).deleteById(1L);
        verify(userRepository, times(1)).deleteById(2L);
        verify(userRepository, never()).deleteById(3L);

        assertThatThrownBy(() -> userService.delete(3L))
                .isInstanceOf(NotFoundException.class);
    }
}