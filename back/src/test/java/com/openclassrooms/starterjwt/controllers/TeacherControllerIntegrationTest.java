package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "oc.app.jwtSecret=testSecretKeyForIntegrationTestsOnlyMustBeLongEnoughForHS512AlgorithmAbCdEfGhIjKlMnOpQrStUvWxYz"
})
@DisplayName("Integration Tests - TeacherController")
class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        // Create a test user
        User user = User.builder()
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("Test")
                .password(passwordEncoder.encode("password"))
                .admin(true)
                .build();
        userRepository.save(user);

        // Authenticate and get a JWT token
        jwtToken = obtainJwtToken("admin@example.com", "password");
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

    // ==================== TESTS GET /api/teacher ====================

    @Test
    @DisplayName("GET /api/teacher - Should return all teachers")
    void testFindAllTeachers_ShouldReturnAllTeachers() throws Exception {
        // GIVEN - Créer des enseignants en base H2
        Teacher teacher1 = new Teacher();
        teacher1.setFirstName("John");
        teacher1.setLastName("Doe");
        teacherRepository.save(teacher1);

        Teacher teacher2 = new Teacher();
        teacher2.setFirstName("Jane");
        teacher2.setLastName("Smith");
        teacherRepository.save(teacher2);

        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].firstName", is("John")))
                .andExpect(jsonPath("$[0].lastName", is("Doe")))
                .andExpect(jsonPath("$[1].firstName", is("Jane")))
                .andExpect(jsonPath("$[1].lastName", is("Smith")));
    }

    @Test
    @DisplayName("GET /api/teacher - Should return empty list if no teachers")
    void testFindAllTeachers_ShouldReturnEmptyListIfNoTeachers() throws Exception {
        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ==================== TESTS GET /api/teacher/{id} ====================

    @Test
    @DisplayName("GET /api/teacher/{id} - Should return teacher by ID")
    void testFindTeacherById_ShouldReturnTeacher() throws Exception {
        // GIVEN - Créer un enseignant en base H2
        Teacher teacher = new Teacher();
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacher = teacherRepository.save(teacher);

        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/teacher/{id}", teacher.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} - Should return 404 if teacher not found")
    void testFindTeacherById_ShouldReturnNotFoundIfTeacherNotFound() throws Exception {
        // WHEN & THEN - Faire une VRAIE requête HTTP
        mockMvc.perform(get("/api/teacher/{id}", 9999L)
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}
