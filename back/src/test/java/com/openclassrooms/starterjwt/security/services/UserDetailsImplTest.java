package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Unit Tests - UserDetailsImpl")
class UserDetailsImplTest {

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("user@yoga.com")
                .firstName("John")
                .lastName("Doe")
                .admin(false)
                .password("encodedPassword123")
                .build();
    }

    // ==================== TESTS des Getters ====================

    @Test
    @DisplayName("getId - Should return user id")
    void testGetId_ShouldReturnUserId() {
        assertThat(userDetails.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getUsername - Should return username")
    void testGetUsername_ShouldReturnUsername() {
        assertThat(userDetails.getUsername()).isEqualTo("user@yoga.com");
    }

    @Test
    @DisplayName("getFirstName - Should return first name")
    void testGetFirstName_ShouldReturnFirstName() {
        assertThat(userDetails.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("getLastName - Should return last name")
    void testGetLastName_ShouldReturnLastName() {
        assertThat(userDetails.getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("getAdmin - Should return admin status")
    void testGetAdmin_ShouldReturnAdminStatus() {
        assertThat(userDetails.getAdmin()).isFalse();
    }

    @Test
    @DisplayName("getPassword - Should return password")
    void testGetPassword_ShouldReturnPassword() {
        assertThat(userDetails.getPassword()).isEqualTo("encodedPassword123");
    }

    @Test
    @DisplayName("getAdmin - Should return true for admin user")
    void testGetAdmin_WithAdminUser_ShouldReturnTrue() {
        UserDetailsImpl adminUser = UserDetailsImpl.builder()
                .id(2L)
                .username("admin@yoga.com")
                .admin(true)
                .password("password")
                .build();

        assertThat(adminUser.getAdmin()).isTrue();
    }

    // ==================== TESTS des Méthodes UserDetails ====================

    @Test
    @DisplayName("getAuthorities - Should return empty collection")
    void testGetAuthorities_ShouldReturnEmptyCollection() {
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        
        assertThat(authorities).isNotNull();
        assertThat(authorities).isEmpty();
    }

    @Test
    @DisplayName("isAccountNonExpired - Should always return true")
    void testIsAccountNonExpired_ShouldReturnTrue() {
        assertThat(userDetails.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("isAccountNonLocked - Should always return true")
    void testIsAccountNonLocked_ShouldReturnTrue() {
        assertThat(userDetails.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("isCredentialsNonExpired - Should always return true")
    void testIsCredentialsNonExpired_ShouldReturnTrue() {
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
    }

    @Test
    @DisplayName("isEnabled - Should always return true")
    void testIsEnabled_ShouldReturnTrue() {
        assertThat(userDetails.isEnabled()).isTrue();
    }

    // ==================== TESTS equals() ====================

    @Test
    @DisplayName("equals - Should return true when comparing same object")
    void testEquals_WithSameObject_ShouldReturnTrue() {
        assertThat(userDetails.equals(userDetails)).isTrue();
    }

    @Test
    @DisplayName("equals - Should return true when ids are equal")
    void testEquals_WithSameId_ShouldReturnTrue() {
        UserDetailsImpl otherUser = UserDetailsImpl.builder()
                .id(1L)
                .username("different@email.com")
                .firstName("Different")
                .lastName("Name")
                .admin(true)
                .password("differentPassword")
                .build();

        assertThat(userDetails.equals(otherUser)).isTrue();
    }

    @Test
    @DisplayName("equals - Should return false when ids are different")
    void testEquals_WithDifferentId_ShouldReturnFalse() {
        UserDetailsImpl otherUser = UserDetailsImpl.builder()
                .id(2L)
                .username("user@yoga.com")
                .firstName("John")
                .lastName("Doe")
                .admin(false)
                .password("encodedPassword123")
                .build();

        assertThat(userDetails.equals(otherUser)).isFalse();
    }

    @Test
    @DisplayName("equals - Should return false when comparing with null")
    void testEquals_WithNull_ShouldReturnFalse() {
        assertThat(userDetails.equals(null)).isFalse();
    }

    @Test
    @DisplayName("equals - Should return false when comparing with different class")
    void testEquals_WithDifferentClass_ShouldReturnFalse() {
        String differentObject = "Not a UserDetailsImpl";
        assertThat(userDetails.equals(differentObject)).isFalse();
    }

    @Test
    @DisplayName("equals - Should be consistent with multiple calls")
    void testEquals_ShouldBeConsistent() {
        UserDetailsImpl otherUser = UserDetailsImpl.builder()
                .id(1L)
                .username("other@email.com")
                .build();

        boolean firstCall = userDetails.equals(otherUser);
        boolean secondCall = userDetails.equals(otherUser);
        boolean thirdCall = userDetails.equals(otherUser);

        assertThat(firstCall).isEqualTo(secondCall).isEqualTo(thirdCall);
    }

    // ==================== TESTS Builder ====================

    @Test
    @DisplayName("builder - Should build UserDetailsImpl with all fields")
    void testBuilder_ShouldBuildWithAllFields() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(10L)
                .username("test@example.com")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("testPassword")
                .build();

        assertThat(user.getId()).isEqualTo(10L);
        assertThat(user.getUsername()).isEqualTo("test@example.com");
        assertThat(user.getFirstName()).isEqualTo("Test");
        assertThat(user.getLastName()).isEqualTo("User");
        assertThat(user.getAdmin()).isTrue();
        assertThat(user.getPassword()).isEqualTo("testPassword");
    }

    @Test
    @DisplayName("builder - Should allow null values")
    void testBuilder_WithNullValues_ShouldWork() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(null)
                .username(null)
                .firstName(null)
                .lastName(null)
                .admin(null)
                .password(null)
                .build();

        assertThat(user.getId()).isNull();
        assertThat(user.getUsername()).isNull();
        assertThat(user.getFirstName()).isNull();
        assertThat(user.getLastName()).isNull();
        assertThat(user.getAdmin()).isNull();
        assertThat(user.getPassword()).isNull();
    }

    // ==================== TESTS AllArgsConstructor ====================

    @Test
    @DisplayName("AllArgsConstructor - Should create UserDetailsImpl with all arguments")
    void testAllArgsConstructor_ShouldCreateInstance() {
        UserDetailsImpl user = new UserDetailsImpl(
                5L,
                "constructor@test.com",
                "Constructor",
                "Test",
                false,
                "constructorPassword"
        );

        assertThat(user.getId()).isEqualTo(5L);
        assertThat(user.getUsername()).isEqualTo("constructor@test.com");
        assertThat(user.getFirstName()).isEqualTo("Constructor");
        assertThat(user.getLastName()).isEqualTo("Test");
        assertThat(user.getAdmin()).isFalse();
        assertThat(user.getPassword()).isEqualTo("constructorPassword");
    }

    // ==================== TESTS Scénarios Réels ====================

    @Test
    @DisplayName("Should work correctly in authentication scenario")
    void testAuthenticationScenario() {
        // Simuler un scénario d'authentification
        UserDetailsImpl authenticatedUser = UserDetailsImpl.builder()
                .id(100L)
                .username("authenticated@yoga.com")
                .firstName("Authenticated")
                .lastName("User")
                .admin(false)
                .password("$2a$10$encodedPassword")
                .build();

        // Vérifier que l'utilisateur est valide pour Spring Security
        assertThat(authenticatedUser.isEnabled()).isTrue();
        assertThat(authenticatedUser.isAccountNonExpired()).isTrue();
        assertThat(authenticatedUser.isAccountNonLocked()).isTrue();
        assertThat(authenticatedUser.isCredentialsNonExpired()).isTrue();
        assertThat(authenticatedUser.getAuthorities()).isEmpty();
    }

    @Test
    @DisplayName("Should distinguish between regular user and admin")
    void testUserRoleDistinction() {
        UserDetailsImpl regularUser = UserDetailsImpl.builder()
                .id(1L)
                .username("regular@test.com")
                .admin(false)
                .password("password")
                .build();

        UserDetailsImpl adminUser = UserDetailsImpl.builder()
                .id(2L)
                .username("admin@test.com")
                .admin(true)
                .password("password")
                .build();

        assertThat(regularUser.getAdmin()).isFalse();
        assertThat(adminUser.getAdmin()).isTrue();
        assertThat(regularUser.equals(adminUser)).isFalse();
    }
}