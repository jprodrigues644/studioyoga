package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;

    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public Session create(Session session) {
        return this.sessionRepository.save(session);
    }

    /**
     * Delete the session by  ID
     * @throws NotFoundException if the session doesnt exist
     */
    public void delete(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new NotFoundException();
        }
        sessionRepository.deleteById(id);
    }

    public List<Session> findAll() {
        return this.sessionRepository.findAll();
    }

    public Session getById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(NotFoundException::new);
    }

    public Session update(Long id, Session session) {
        if (!sessionRepository.existsById(id)) {
            throw new NotFoundException();
        }
        session.setId(id);
        return sessionRepository.save(session);
    }

    public void participate(Long id, Long userId) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        User user = userRepository.findById(userId)
                .orElseThrow(NotFoundException::new);

        boolean alreadyParticipate = session.getUsers().stream()
                .anyMatch(u -> u.getId().equals(userId));

        if (alreadyParticipate) {
            throw new BadRequestException();
        }

        session.getUsers().add(user);
        sessionRepository.save(session);
    }

    public void noLongerParticipate(Long id, Long userId) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        boolean alreadyParticipate = session.getUsers().stream()
                .anyMatch(u -> u.getId().equals(userId));

        if (!alreadyParticipate) {
            throw new BadRequestException();
        }

        session.setUsers(
                session.getUsers().stream()
                        .filter(user -> !user.getId().equals(userId))
                        .collect(Collectors.toList())
        );

        sessionRepository.save(session);
    }
}
