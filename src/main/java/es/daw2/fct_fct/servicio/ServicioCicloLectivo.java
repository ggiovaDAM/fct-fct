package es.daw2.fct_fct.servicio;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import es.daw2.fct_fct.modelo.CicloLectivo;
import es.daw2.fct_fct.repositorio.RepositorioCicloLectivo;

@Service
public class ServicioCicloLectivo extends AbstractService<Long, CicloLectivo, RepositorioCicloLectivo> {
    @Override
    public Optional<CicloLectivo> getById(Long id) {
        Optional<CicloLectivo> cicloLectivo = repository.findById(id);
        return cicloLectivo.filter((c) -> c.getDeletedAt() == null);
    }
    
    @Override
    public List<CicloLectivo> list() {
        List<CicloLectivo> ciclosLectivos = (List<CicloLectivo>) repository.findAll();
        ciclosLectivos = ciclosLectivos.stream()
            .filter((ciclo) -> ciclo.getDeletedAt() == null)
            .toList();
        return ciclosLectivos;
    }

    @Override
    public boolean delete(Long id) {
        if (id == null) return false;
        Optional<CicloLectivo> cicloLectivo = repository.findById(id);
        if (cicloLectivo.filter((c) -> c.getDeletedAt() == null).isEmpty()) {
            return false;
        }
        cicloLectivo.get().setDeletedAt(LocalDateTime.now());
        repository.save(cicloLectivo.get());
        return true;
    }

    public Optional<CicloLectivo> getCicloLectivoActual() {
        List<CicloLectivo> ciclosLectivos = (List<CicloLectivo>) this.list();
        Optional<CicloLectivo> cicloActual = ciclosLectivos.stream()
            .filter(ciclo -> ciclo.getFechaFin() == null)
            .findFirst();

        if (cicloActual.isPresent()) return cicloActual;

        cicloActual = ciclosLectivos.stream()
            .sorted((c1, c2) -> c2.getFechaInicio().compareTo(c1.getFechaInicio()))
            .findFirst();

        return cicloActual;
    }
}
