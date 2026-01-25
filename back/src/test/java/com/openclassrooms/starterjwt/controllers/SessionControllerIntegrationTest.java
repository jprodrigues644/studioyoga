package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "oc.app.jwtSecret=testSecretKeyForIntegrationTestsOnlyMustBeLongEnoughForHS512AlgorithmAbCdEfGhIjKlMnOpQrStUvWxYz"
})
public class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    private String jwtToken;

    @BeforeEach
    public void setup() throws Exception {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        // Create a test user
        User user = User.builder()
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("Test")
                .password(passwordEncoder.encode("password"))
                .admin(true)
                .build();
        userRepository.save(user);

        // Create a test teacher
        Teacher teacher = new Teacher();
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacherRepository.save(teacher);

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

    @Test
    public void testCreateSession() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);
        Long teacherId = teacher.getId();

        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacherId);
        sessionDto.setDescription("A relaxing yoga session");
        sessionDto.setUsers(new ArrayList<>());

        mockMvc.perform(post("/api/session")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Session"));
    }

    @Test
    public void testGetAllSessions() throws Exception {
        mockMvc.perform(get("/api/session")
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void testGetSessionById() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);

        Session session = new Session();
        session.setName("Pilates Session");
        session.setDate(new Date());
        session.setTeacher(teacher);
        session.setDescription("An energizing pilates session");
        session = sessionRepository.save(session);

        mockMvc.perform(get("/api/session/{id}", session.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Pilates Session"));
    }

    @Test
    public void testUpdateSession() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);

        Session session = new Session();
        session.setName("Cardio Session");
        session.setDate(new Date());
        session.setTeacher(teacher);
        session.setDescription("A high-intensity cardio session");
        session = sessionRepository.save(session);
        Long sessionId = session.getId();
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Updated Cardio Session");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacher.getId());
        sessionDto.setDescription("An updated high-intensity cardio session");
        sessionDto.setUsers(new ArrayList<>());
        mockMvc.perform(put("/api/session/{id}", sessionId)
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Cardio Session"));
    }

    @Test
    public void testDeleteSession() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);
        Session session = new Session();
        session.setName("Strength Session");
        session.setDate(new Date());
        session.setTeacher(teacher);
        session.setDescription("A muscle-strengthening session");
        session = sessionRepository.save(session);
        Long sessionId = session.getId();

        mockMvc.perform(delete("/api/session/{id}", sessionId)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void testGetNonExistentSession() throws Exception {
        mockMvc.perform(get("/api/session/{id}", 9999L)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUpdateNonExistentSession() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Non-existent Session");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacher.getId());
        sessionDto.setDescription("This session does not exist");
        sessionDto.setUsers(new ArrayList<>());

        mockMvc.perform(put("/api/session/{id}", 9999L)
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteNonExistentSession() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 9999L)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    public void testParticipate() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);
        Session session = new Session();
        session.setName("Participation Test Session");
        session.setDate(new Date());
        session.setTeacher(teacher);
        session.setDescription("A session for participation test");
        session = sessionRepository.save(session);
        Long sessionId = session.getId();

        User user = new User();
        user.setEmail("user@example.com");
        user.setFirstName("User");
        user.setLastName("Test");
        user.setPassword(passwordEncoder.encode("password"));
        user.setAdmin(false);
        user = userRepository.save(user);
        Long userId = user.getId();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void testNoLongerParticipate() throws Exception {
        Teacher teacher = teacherRepository.findAll().get(0);
        Session session = new Session();
        session.setName("Unparticipation Test Session");
        session.setDate(new Date());
        session.setTeacher(teacher);
        session.setDescription("A session for unparticipation test");
        session = sessionRepository.save(session);
        Long sessionId = session.getId();

        User user = new User();
        user.setEmail("user2@example.com");
        user.setFirstName("User2");
        user.setLastName("Test");
        user.setPassword(passwordEncoder.encode("password"));
        user.setAdmin(false);
        user = userRepository.save(user);
        Long userId = user.getId();

        sessionService.participate(sessionId, userId);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void testParticipateNonExistentSession() throws Exception {
        User user = new User();
        user.setEmail("user3@example.com");
        user.setFirstName("User3");
        user.setLastName("Test");
        user.setPassword(passwordEncoder.encode("password"));
        user.setAdmin(false);
        user = userRepository.save(user);
        Long userId = user.getId();

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", 9999L, userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    public void testNoLongerParticipateNonExistentSession() throws Exception {
        User user = new User();
        user.setEmail("user4@example.com");
        user.setFirstName("User4");
        user.setLastName("Test");
        user.setPassword(passwordEncoder.encode("password"));
        user.setAdmin(false);
        user = userRepository.save(user);
        Long userId = user.getId();

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", 9999L, userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}
