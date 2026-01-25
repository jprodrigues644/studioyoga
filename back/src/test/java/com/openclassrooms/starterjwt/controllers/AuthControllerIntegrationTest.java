package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest  // ← Lance TOUT le contexte Spring
@AutoConfigureMockMvc  // ← Configure MockMvc automatiquement
@TestPropertySource(properties = {
    "oc.app.jwtSecret=testSecretKeyForIntegrationTestsOnlyMustBeLongEnoughForHS512AlgorithmAbCdEfGhIjKlMnOpQrStUvWxYz"
})
@DisplayName("Integration Tests - AuthController")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;  // ← Pour simuler les requêtes HTTP

    @Autowired
    private ObjectMapper objectMapper;  // ← Pour convertir les objets en JSON

    @Autowired
    private UserRepository userRepository;  // ← Le VRAI repository avec H2

    @Autowired
    private PasswordEncoder passwordEncoder;  // ← Le VRAI encoder

    @BeforeEach
    void setUp() {
        // Nettoyer la base H2 avant chaque test
        userRepository.deleteAll();
    }

    // ==================== TESTS POST /api/auth/login ====================

    @Test
    @DisplayName("POST /api/auth/login - Should authenticate user with valid credentials")
    void testLogin_WithValidCredentials_ShouldReturnJwtToken() throws Exception {
        // GIVEN - Créer un utilisateur RÉELLEMENT en base H2
        User user = User.builder()
                .email("yoga@test.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password123"))
                .admin(false)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("yoga@test.com");
        loginRequest.setPassword("password123");

        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())  // Affiche la requête/réponse pour debug
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.username", is("yoga@test.com")))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")))
                .andExpect(jsonPath("$.admin", is(false)));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 401 with invalid password")
    void testLogin_WithInvalidPassword_ShouldReturnUnauthorized() throws Exception {
        // GIVEN
        User user = User.builder()
                .email("yoga@test.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password123"))
                .admin(false)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("yoga@test.com");
        loginRequest.setPassword("wrongpassword");  // Mauvais mot de passe

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 401 with non-existent user")
    void testLogin_WithNonExistentUser_ShouldReturnUnauthorized() throws Exception {
        // GIVEN
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@test.com");
        loginRequest.setPassword("password123");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 400 with missing email")
    void testLogin_WithMissingEmail_ShouldReturnBadRequest() throws Exception {
        // GIVEN
        String invalidJson = "{\"password\":\"password123\"}";

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 400 with empty email")
    void testLogin_WithEmptyEmail_ShouldReturnBadRequest() throws Exception {
        // GIVEN
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("");
        loginRequest.setPassword("password123");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 400 with missing password")
    void testLogin_WithMissingPassword_ShouldReturnBadRequest() throws Exception {
        // GIVEN
        String invalidJson = "{\"email\":\"yoga@test.com\"}";

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should authenticate admin user")
    void testLogin_WithAdminUser_ShouldReturnAdminTrue() throws Exception {
        // GIVEN
        User adminUser = User.builder()
                .email("admin@yoga.com")
                .firstName("Admin")
                .lastName("User")
                .password(passwordEncoder.encode("adminpass"))
                .admin(true)  // Admin = true
                .build();
        userRepository.save(adminUser);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@yoga.com");
        loginRequest.setPassword("adminpass");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin", is(true)))
                .andExpect(jsonPath("$.username", is("admin@yoga.com")));
    }

    // ==================== TESTS POST /api/auth/register ====================

    @Test
    @DisplayName("POST /api/auth/register - Should register new user successfully")
    void testRegister_WithValidData_ShouldCreateUser() throws Exception {
        // GIVEN
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@yoga.com");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("securePassword123");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User registered successfully!")));

        // Vérifier que l'utilisateur est VRAIMENT en base H2
        User userInDb = userRepository.findByEmail("newuser@yoga.com").orElse(null);
        assertThat(userInDb).isNotNull();
        assertThat(userInDb.getFirstName()).isEqualTo("Jane");
        assertThat(userInDb.getLastName()).isEqualTo("Smith");
        assertThat(userInDb.getEmail()).isEqualTo("newuser@yoga.com");
        assertThat(userInDb.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("POST /api/auth/register - Should return 400 when email already exists")
    void testRegister_WithExistingEmail_ShouldReturnBadRequest() throws Exception {
        // GIVEN - Créer un utilisateur existant
        User existingUser = User.builder()
                .email("existing@yoga.com")
                .firstName("Existing")
                .lastName("User")
                .password(passwordEncoder.encode("password123"))
                .admin(false)
                .build();
        userRepository.save(existingUser);

        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("existing@yoga.com");  // Même email
        signupRequest.setFirstName("New");
        signupRequest.setLastName("User");
        signupRequest.setPassword("password456");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should return 400 with invalid email format")
    void testRegister_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        // GIVEN
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("invalid-email");  // Email invalide
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("password123");

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should return 400 with missing firstName")
    void testRegister_WithMissingFirstName_ShouldReturnBadRequest() throws Exception {
        // GIVEN
        String invalidJson = "{\"email\":\"test@yoga.com\",\"lastName\":\"Smith\",\"password\":\"password123\"}";

        // WHEN & THEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should encrypt password in database")
    void testRegister_ShouldEncryptPassword() throws Exception {
        // GIVEN
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("secure@yoga.com");
        signupRequest.setFirstName("Secure");
        signupRequest.setLastName("User");
        signupRequest.setPassword("plainPassword123");

        // WHEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // THEN - Vérifier que le mot de passe est VRAIMENT encrypté
        User userInDb = userRepository.findByEmail("secure@yoga.com").orElseThrow();
        assertThat(userInDb.getPassword()).isNotEqualTo("plainPassword123");
        assertThat(passwordEncoder.matches("plainPassword123", userInDb.getPassword())).isTrue();
    }

    @Test
    @DisplayName("POST /api/auth/register - Should create user with admin=false by default")
    void testRegister_ShouldCreateNonAdminUserByDefault() throws Exception {
        // GIVEN
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("regular@yoga.com");
        signupRequest.setFirstName("Regular");
        signupRequest.setLastName("User");
        signupRequest.setPassword("password123");

        // WHEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // THEN
        User userInDb = userRepository.findByEmail("regular@yoga.com").orElseThrow();
        assertThat(userInDb.isAdmin()).isFalse();
    }

    // ==================== TEST Workflow Complet ====================

    @Test
    @DisplayName("Full Workflow - Register then Login")
    void testFullWorkflow_RegisterThenLogin() throws Exception {
        // GIVEN - Register
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("workflow@test.com");
        signupRequest.setFirstName("Workflow");
        signupRequest.setLastName("Test");
        signupRequest.setPassword("workflowPassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // WHEN - Login avec le même utilisateur
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("workflow@test.com");
        loginRequest.setPassword("workflowPassword");

        // THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.username", is("workflow@test.com")))
                .andExpect(jsonPath("$.firstName", is("Workflow")))
                .andExpect(jsonPath("$.lastName", is("Test")));
    }
}