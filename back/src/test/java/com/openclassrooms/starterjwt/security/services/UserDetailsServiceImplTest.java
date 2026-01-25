package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests - UserDetailsServiceImpl")
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user@yoga.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("encodedPassword123")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername - Should return UserDetails when email exists")
    void testLoadUserByUsername_WithValidEmail_ShouldReturnUserDetails() {
        // GIVEN
        String email = "user@yoga.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        // WHEN
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // THEN
        assertThat(userDetails).isNotNull();
        assertThat(userDetails).isInstanceOf(UserDetailsImpl.class);
        
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertThat(userDetailsImpl.getId()).isEqualTo(1L);
        assertThat(userDetailsImpl.getUsername()).isEqualTo("user@yoga.com");
        assertThat(userDetailsImpl.getFirstName()).isEqualTo("Jane");
        assertThat(userDetailsImpl.getLastName()).isEqualTo("Smith");
        assertThat(userDetailsImpl.getPassword()).isEqualTo("encodedPassword123");
        
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    @DisplayName("loadUserByUsername - Should throw UsernameNotFoundException when email does not exist")
    void testLoadUserByUsername_WithInvalidEmail_ShouldThrowException() {
        // GIVEN
        String nonExistentEmail = "nonexistent@yoga.com";
        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername(nonExistentEmail))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User Not Found with email: " + nonExistentEmail);

        verify(userRepository, times(1)).findByEmail(nonExistentEmail);
    }

    @Test
    @DisplayName("loadUserByUsername - Should preserve all user properties in UserDetails")
    void testLoadUserByUsername_ShouldPreserveAllUserProperties() {
        // GIVEN
        User adminUser = User.builder()
                .id(2L)
                .email("admin@yoga.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminPassword")
                .admin(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail("admin@yoga.com")).thenReturn(Optional.of(adminUser));

        // WHEN
        UserDetails userDetails = userDetailsService.loadUserByUsername("admin@yoga.com");

        // THEN
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertThat(userDetailsImpl.getId()).isEqualTo(2L);
        assertThat(userDetailsImpl.getUsername()).isEqualTo("admin@yoga.com");
        assertThat(userDetailsImpl.getFirstName()).isEqualTo("Admin");
        assertThat(userDetailsImpl.getLastName()).isEqualTo("User");
        assertThat(userDetailsImpl.getPassword()).isEqualTo("adminPassword");
    }

    @Test
    @DisplayName("loadUserByUsername - Should call repository exactly once")
    void testLoadUserByUsername_ShouldCallRepositoryOnce() {
        // GIVEN
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // WHEN
        userDetailsService.loadUserByUsername("user@yoga.com");

        // THEN
        verify(userRepository, times(1)).findByEmail("user@yoga.com");
        verifyNoMoreInteractions(userRepository);
    }
}