package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.hamcrest.Matchers.is;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "oc.app.jwtSecret=testSecretKeyForIntegrationTestsOnlyMustBeLongEnoughForHS512AlgorithmAbCdEfGhIjKlMnOpQrStUvWxYz"
})
@DisplayName("Integration Tests - UserController")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();

        // Create a test user
        User user = User.builder()
                .email("user@example.com")
                .firstName("User")
                .lastName("Test")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        userRepository.save(user);

        // Authenticate and get a JWT token
        jwtToken = obtainJwtToken("user@example.com", "password");
    }

    private String obtainJwtToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        JwtResponse jwtResponse = objectMapper.readValue(response, JwtResponse.class);
        return jwtResponse.getToken();
    }

    // ==================== TESTS GET /api/user/{id} ====================

    @Test
    @DisplayName("GET /api/user/{id} - Should return user by ID")
    void testFindUserById_ShouldReturnUser() throws Exception {
        // GIVEN - Utiliser l'utilisateur déjà créé dans setUp
        User user = userRepository.findByEmail("user@example.com").orElseThrow();

        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/user/{id}", user.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("user@example.com")))
                .andExpect(jsonPath("$.firstName", is("User")))
                .andExpect(jsonPath("$.lastName", is("Test")));
    }

    @Test
    @DisplayName("GET /api/user/{id} - Should return 404 if user not found")
    void testFindUserById_ShouldReturnNotFoundIfUserNotFound() throws Exception {
        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/user/{id}", 9999L)
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    // ==================== TESTS DELETE /api/user/{id} ====================

    @Test
    @DisplayName("DELETE /api/user/{id} - Should delete user if authorized")
    void testDeleteUser_ShouldDeleteUserIfAuthorized() throws Exception {
        // GIVEN - Utiliser l'utilisateur déjà créé dans setUp
        User user = userRepository.findByEmail("user@example.com").orElseThrow();

        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(delete("/api/user/{id}", user.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk());

        // Vérifier que l'utilisateur a bien été supprimé
        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Should return 401 if unauthorized")
    void testDeleteUser_ShouldReturnUnauthorizedIfUnauthorized() throws Exception {
        // GIVEN - Créer un autre utilisateur
        User anotherUser = User.builder()
                .email("another@example.com")
                .firstName("Another")
                .lastName("User")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        anotherUser = userRepository.save(anotherUser);

        // WHEN & THEN - Faire une VRAIE requête HTTP avec un utilisateur non autorisé
        mockMvc.perform(delete("/api/user/{id}", anotherUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} - Should return 404 if user not found")
    void testDeleteUser_ShouldReturnNotFoundIfUserNotFound() throws Exception {
        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(delete("/api/user/{id}", 9999L)
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}
