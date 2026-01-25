package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests - SessionService")
class SessionServiceTest {

    // ==================== MOCKS ====================
    
    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    // ==================== SERVICE TESTÉ ====================
    
    @InjectMocks
    private SessionService sessionService;

    // ==================== DONNÉES DE TEST ====================
    
    private Session testSession;
    private User user1;
    private User user2;
    private User user3;
    private Teacher teacher;

    @BeforeEach
    void setUp() {
        // Créer un professeur
        teacher = Teacher.builder()
                .id(1L)
                .firstName("Margot")
                .lastName("DELAHAYE")
                .build();

        // Créer des utilisateurs
        user1 = User.builder()
                .id(1L)
                .email("user1@yoga.com")
                .firstName("User")
                .lastName("One")
                .password("password")
                .admin(false)
                .build();

        user2 = User.builder()
                .id(2L)
                .email("user2@yoga.com")
                .firstName("User")
                .lastName("Two")
                .password("password")
                .admin(false)
                .build();

        user3 = User.builder()
                .id(3L)
                .email("user3@yoga.com")
                .firstName("User")
                .lastName("Three")
                .password("password")
                .admin(false)
                .build();

        // Créer une session avec une liste de participants modifiable
        testSession = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("A relaxing yoga session")
                .teacher(teacher)
                .users(new ArrayList<>(Arrays.asList(user1, user2)))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ==================== TESTS create() ====================

    @Test
    @DisplayName("create - Should create and return session")
    void testCreate_ShouldSaveAndReturnSession() {
        // GIVEN
        Session newSession = Session.builder()
                .name("New Session")
                .date(new Date())
                .description("Description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.save(newSession)).thenAnswer(invocation -> {
            Session saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        // WHEN
        Session created = sessionService.create(newSession);

        // THEN
        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(10L);
        assertThat(created.getName()).isEqualTo("New Session");
        
        verify(sessionRepository, times(1)).save(newSession);
    }

    @Test
    @DisplayName("create - Should preserve all session properties")
    void testCreate_ShouldPreserveAllProperties() {
        // GIVEN
        Date specificDate = new Date();
        Session session = Session.builder()
                .name("Specific Session")
                .date(specificDate)
                .description("Specific Description")
                .teacher(teacher)
                .users(new ArrayList<>(List.of(user1)))
                .build();

        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Session created = sessionService.create(session);

        // THEN
        assertThat(created.getName()).isEqualTo("Specific Session");
        assertThat(created.getDate()).isEqualTo(specificDate);
        assertThat(created.getDescription()).isEqualTo("Specific Description");
        assertThat(created.getTeacher()).isEqualTo(teacher);
        assertThat(created.getUsers()).hasSize(1);
    }

    // ==================== TESTS delete() ====================

    @Test
    @DisplayName("delete - Should delete session when id exists")
    void testDelete_WithValidId_ShouldDeleteSession() {
        // GIVEN
        Long sessionId = 1L;
        when(sessionRepository.existsById(sessionId)).thenReturn(true);
        doNothing().when(sessionRepository).deleteById(sessionId);

        // WHEN
        sessionService.delete(sessionId);

        // THEN
        verify(sessionRepository, times(1)).existsById(sessionId);
        verify(sessionRepository, times(1)).deleteById(sessionId);
    }

    @Test
    @DisplayName("delete - Should throw NotFoundException when session does not exist")
    void testDelete_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        Long nonExistentId = 999L;
        when(sessionRepository.existsById(nonExistentId)).thenReturn(false);

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.delete(nonExistentId))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).existsById(nonExistentId);
        verify(sessionRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("delete - Should check existence before deleting")
    void testDelete_ShouldCheckExistenceFirst() {
        // GIVEN
        when(sessionRepository.existsById(anyLong())).thenReturn(true);

        // WHEN
        sessionService.delete(1L);

        // THEN
        var inOrder = inOrder(sessionRepository);
        inOrder.verify(sessionRepository).existsById(1L);
        inOrder.verify(sessionRepository).deleteById(1L);
    }

    // ==================== TESTS findAll() ====================

    @Test
    @DisplayName("findAll - Should return all sessions")
    void testFindAll_ShouldReturnAllSessions() {
        // GIVEN
        Session session2 = Session.builder()
                .id(2L)
                .name("Session 2")
                .date(new Date())
                .description("Description 2")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        List<Session> sessions = Arrays.asList(testSession, session2);
        when(sessionRepository.findAll()).thenReturn(sessions);

        // WHEN
        List<Session> found = sessionService.findAll();

        // THEN
        assertThat(found).hasSize(2);
        assertThat(found).containsExactly(testSession, session2);
        
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Should return empty list when no sessions exist")
    void testFindAll_WhenNoSessions_ShouldReturnEmptyList() {
        // GIVEN
        when(sessionRepository.findAll()).thenReturn(Collections.emptyList());

        // WHEN
        List<Session> found = sessionService.findAll();

        // THEN
        assertThat(found).isEmpty();
    }

    // ==================== TESTS getById() ====================

    @Test
    @DisplayName("getById - Should return session when id exists")
    void testGetById_WithValidId_ShouldReturnSession() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));

        // WHEN
        Session found = sessionService.getById(1L);

        // THEN
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(1L);
        assertThat(found.getName()).isEqualTo("Yoga Session");
        
        verify(sessionRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getById - Should throw NotFoundException when session does not exist")
    void testGetById_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        when(sessionRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.getById(999L))
                .isInstanceOf(NotFoundException.class);
    }

    // ==================== TESTS update() ====================

    @Test
    @DisplayName("update - Should update and return session when id exists")
    void testUpdate_WithValidId_ShouldUpdateSession() {
        // GIVEN
        Long sessionId = 1L;
        Session updatedData = Session.builder()
                .name("Updated Session")
                .date(new Date())
                .description("Updated Description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.existsById(sessionId)).thenReturn(true);
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Session updated = sessionService.update(sessionId, updatedData);

        // THEN
        assertThat(updated.getId()).isEqualTo(sessionId);
        assertThat(updated.getName()).isEqualTo("Updated Session");
        assertThat(updated.getDescription()).isEqualTo("Updated Description");
        
        verify(sessionRepository, times(1)).existsById(sessionId);
        verify(sessionRepository, times(1)).save(updatedData);
    }

    @Test
    @DisplayName("update - Should throw NotFoundException when session does not exist")
    void testUpdate_WithInvalidId_ShouldThrowNotFoundException() {
        // GIVEN
        Long nonExistentId = 999L;
        Session updateData = Session.builder().name("Updated").build();
        
        when(sessionRepository.existsById(nonExistentId)).thenReturn(false);

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.update(nonExistentId, updateData))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("update - Should set id on session before saving")
    void testUpdate_ShouldSetIdBeforeSaving() {
        // GIVEN
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        Session updateData = Session.builder().name("Test").build();
        
        when(sessionRepository.existsById(5L)).thenReturn(true);
        when(sessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        sessionService.update(5L, updateData);

        // THEN
        verify(sessionRepository).save(sessionCaptor.capture());
        assertThat(sessionCaptor.getValue().getId()).isEqualTo(5L);
    }

    // ==================== TESTS participate() ====================

    @Test
    @DisplayName("participate - Should add user to session when user not already participating")
    void testParticipate_WithNewUser_ShouldAddUserToSession() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));
        when(userRepository.findById(3L)).thenReturn(Optional.of(user3));
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        sessionService.participate(1L, 3L);

        // THEN
        assertThat(testSession.getUsers()).contains(user3);
        assertThat(testSession.getUsers()).hasSize(3);
        
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(3L);
        verify(sessionRepository, times(1)).save(testSession);
    }

    @Test
    @DisplayName("participate - Should throw BadRequestException when user already participating")
    void testParticipate_WithExistingUser_ShouldThrowBadRequestException() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("participate - Should throw NotFoundException when session does not exist")
    void testParticipate_WithInvalidSessionId_ShouldThrowNotFoundException() {
        // GIVEN
        when(sessionRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.participate(999L, 3L))
                .isInstanceOf(NotFoundException.class);

        verify(userRepository, never()).findById(anyLong());
        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("participate - Should throw NotFoundException when user does not exist")
    void testParticipate_WithInvalidUserId_ShouldThrowNotFoundException() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.participate(1L, 999L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    // ==================== TESTS noLongerParticipate() ====================

    @Test
    @DisplayName("noLongerParticipate - Should remove user from session when user is participating")
    void testNoLongerParticipate_WithParticipatingUser_ShouldRemoveUser() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        int initialSize = testSession.getUsers().size();

        // WHEN
        sessionService.noLongerParticipate(1L, 1L);

        // THEN
        assertThat(testSession.getUsers()).doesNotContain(user1);
        assertThat(testSession.getUsers()).hasSize(initialSize - 1);
        assertThat(testSession.getUsers()).contains(user2);
        
        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(testSession);
    }

    @Test
    @DisplayName("noLongerParticipate - Should throw BadRequestException when user not participating")
    void testNoLongerParticipate_WithNonParticipatingUser_ShouldThrowBadRequestException() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 3L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("noLongerParticipate - Should throw NotFoundException when session does not exist")
    void testNoLongerParticipate_WithInvalidSessionId_ShouldThrowNotFoundException() {
        // GIVEN
        when(sessionRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThatThrownBy(() -> sessionService.noLongerParticipate(999L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("noLongerParticipate - Should only remove specified user")
    void testNoLongerParticipate_ShouldOnlyRemoveSpecifiedUser() {
        // GIVEN
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(testSession));
        when(sessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        sessionService.noLongerParticipate(1L, 1L);

        // THEN
        assertThat(testSession.getUsers()).doesNotContain(user1);
        assertThat(testSession.getUsers()).contains(user2);
        assertThat(testSession.getUsers()).hasSize(1);
    }

    @Test
    @DisplayName("noLongerParticipate - Should handle removing last user")
    void testNoLongerParticipate_WithLastUser_ShouldResultInEmptyList() {
        // GIVEN
        Session singleUserSession = Session.builder()
                .id(2L)
                .name("Single User Session")
                .date(new Date())
                .description("Description")
                .teacher(teacher)
                .users(new ArrayList<>(List.of(user1)))
                .build();

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(singleUserSession));
        when(sessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        sessionService.noLongerParticipate(2L, 1L);

        // THEN
        assertThat(singleUserSession.getUsers()).isEmpty();
    }
}