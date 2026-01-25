package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests - AuthService")
class AuthServiceTest {

    // ==================== MOCKS ====================
    
    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    // ==================== SERVICE TESTÉ ====================
    
    @InjectMocks
    private AuthService authService;

    // ==================== DONNÉES DE TEST ====================
    
    private User testUser;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        // Créer un utilisateur de test
        testUser = User.builder()
                .id(1L)
                .email("yoga@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword123")
                .admin(false)
                .build();

        // Créer une requête de login
        loginRequest = new LoginRequest();
        loginRequest.setEmail("yoga@test.com");
        loginRequest.setPassword("password123");

        // Créer une requête de signup
        signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@yoga.com");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("password123");

        // Créer un UserDetails pour simuler l'authentification
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("yoga@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword123")
                .admin(false)
                .build();
    }

    // ==================== TESTS authenticateUser ====================

    @Test
    @DisplayName("authenticateUser - Should return JwtResponse when credentials are valid")
    void testAuthenticateUser_WithValidCredentials_ShouldReturnJwtResponse() {
        // GIVEN
        String expectedToken = "fake-jwt-token-12345";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal())
                .thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication))
                .thenReturn(expectedToken);
        when(userRepository.findByEmail("yoga@test.com"))
                .thenReturn(Optional.of(testUser));

        // WHEN
        JwtResponse response = authService.authenticateUser(loginRequest);

        // THEN
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo(expectedToken);
        assertThat(response.getType()).isEqualTo("Bearer");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("yoga@test.com");
        assertThat(response.getFirstName()).isEqualTo("John");
        assertThat(response.getLastName()).isEqualTo("Doe");
        assertThat(response.getAdmin()).isFalse();

        // Vérifier que les méthodes ont été appelées
        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(authentication);
        verify(userRepository, times(1)).findByEmail("yoga@test.com");
    }

    @Test
    @DisplayName("authenticateUser - Should authenticate with correct email and password")
    void testAuthenticateUser_ShouldUseCorrectCredentials() {
        // GIVEN
        ArgumentCaptor<UsernamePasswordAuthenticationToken> authCaptor = 
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("token");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // WHEN
        authService.authenticateUser(loginRequest);

        // THEN
        verify(authenticationManager).authenticate(authCaptor.capture());
        UsernamePasswordAuthenticationToken capturedAuth = authCaptor.getValue();
        assertThat(capturedAuth.getPrincipal()).isEqualTo("yoga@test.com");
        assertThat(capturedAuth.getCredentials()).isEqualTo("password123");
    }

    @Test
    @DisplayName("authenticateUser - Should return admin=true when user is admin")
    void testAuthenticateUser_WithAdminUser_ShouldReturnAdminTrue() {
        // GIVEN
        User adminUser = User.builder()
                .id(2L)
                .email("admin@yoga.com")
                .firstName("Admin")
                .lastName("User")
                .password("encodedPassword")
                .admin(true)  // Admin = true
                .build();

        UserDetailsImpl adminDetails = UserDetailsImpl.builder()
                .id(2L)
                .username("admin@yoga.com")
                .firstName("Admin")
                .lastName("User")
                .password("encodedPassword")
                .admin(true)
                .build();

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("admin-token");
        when(userRepository.findByEmail("admin@yoga.com")).thenReturn(Optional.of(adminUser));

        LoginRequest adminLoginRequest = new LoginRequest();
        adminLoginRequest.setEmail("admin@yoga.com");
        adminLoginRequest.setPassword("adminpass");

        // WHEN
        JwtResponse response = authService.authenticateUser(adminLoginRequest);

        // THEN
        assertThat(response.getAdmin()).isTrue();
        assertThat(response.getUsername()).isEqualTo("admin@yoga.com");
    }

    @Test
    @DisplayName("authenticateUser - Should throw RuntimeException when user not found in database")
    void testAuthenticateUser_WhenUserNotFoundInDb_ShouldThrowException() {
        // GIVEN
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail("yoga@test.com")).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> authService.authenticateUser(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found after authentication");

        verify(userRepository, times(1)).findByEmail("yoga@test.com");
    }

    @Test
    @DisplayName("authenticateUser - Should generate JWT token from authentication")
    void testAuthenticateUser_ShouldGenerateJwtFromAuthentication() {
        // GIVEN
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("generated-jwt-token");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // WHEN
        JwtResponse response = authService.authenticateUser(loginRequest);

        // THEN
        assertThat(response.getToken()).isEqualTo("generated-jwt-token");
        verify(jwtUtils, times(1)).generateJwtToken(authentication);
    }

    // ==================== TESTS registerUser ====================

    @Test
    @DisplayName("registerUser - Should create new user successfully")
    void testRegisterUser_WithValidData_ShouldCreateUser() {
        // GIVEN
        when(userRepository.existsByEmail("newuser@yoga.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);  // Simuler l'ID généré par la base
            return savedUser;
        });

        // WHEN
        authService.registerUser(signupRequest);

        // THEN
        verify(userRepository, times(1)).existsByEmail("newuser@yoga.com");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("registerUser - Should save user with encoded password")
    void testRegisterUser_ShouldEncodePasswordBeforeSaving() {
        // GIVEN
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("super-encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.registerUser(signupRequest);

        // THEN
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        
        assertThat(savedUser.getPassword()).isEqualTo("super-encoded-password");
        assertThat(savedUser.getEmail()).isEqualTo("newuser@yoga.com");
        assertThat(savedUser.getFirstName()).isEqualTo("Jane");
        assertThat(savedUser.getLastName()).isEqualTo("Smith");
        assertThat(savedUser.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("registerUser - Should create user with admin=false by default")
    void testRegisterUser_ShouldCreateNonAdminUserByDefault() {
        // GIVEN
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.registerUser(signupRequest);

        // THEN
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().isAdmin()).isFalse();
    }

    @Test
    @DisplayName("registerUser - Should throw IllegalArgumentException when email already exists")
    void testRegisterUser_WithExistingEmail_ShouldThrowException() {
        // GIVEN
        when(userRepository.existsByEmail("newuser@yoga.com")).thenReturn(true);

        // WHEN & THEN
        assertThatThrownBy(() -> authService.registerUser(signupRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("This Email is already taken");

        verify(userRepository, times(1)).existsByEmail("newuser@yoga.com");
        verify(userRepository, never()).save(any(User.class));  // save() ne doit PAS être appelé
        verify(passwordEncoder, never()).encode(anyString());   // encode() ne doit PAS être appelé
    }

    @Test
    @DisplayName("registerUser - Should check email existence before creating user")
    void testRegisterUser_ShouldCheckEmailExistenceFirst() {
        // GIVEN
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.registerUser(signupRequest);

        // THEN
        // Vérifier l'ordre d'exécution : existsByEmail AVANT save
        var inOrder = inOrder(userRepository, passwordEncoder);
        inOrder.verify(userRepository).existsByEmail("newuser@yoga.com");
        inOrder.verify(passwordEncoder).encode("password123");
        inOrder.verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("registerUser - Should preserve all user data from SignupRequest")
    void testRegisterUser_ShouldPreserveAllUserData() {
        // GIVEN
        SignupRequest customRequest = new SignupRequest();
        customRequest.setEmail("custom@yoga.com");
        customRequest.setFirstName("Custom");
        customRequest.setLastName("User");
        customRequest.setPassword("customPass");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.registerUser(customRequest);

        // THEN
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        
        assertThat(savedUser.getEmail()).isEqualTo("custom@yoga.com");
        assertThat(savedUser.getFirstName()).isEqualTo("Custom");
        assertThat(savedUser.getLastName()).isEqualTo("User");
    }

    @Test
    @DisplayName("registerUser - Should call passwordEncoder exactly once")
    void testRegisterUser_ShouldEncodePasswordOnce() {
        // GIVEN
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.registerUser(signupRequest);

        // THEN
        verify(passwordEncoder, times(1)).encode("password123");
        verify(passwordEncoder, times(1)).encode(anyString());  
    }
}