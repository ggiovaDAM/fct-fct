package es.daw2.fct_fct.controlador;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.daw2.fct_fct.dto.AlumnoActualizarCursoDTO;
import es.daw2.fct_fct.dto.AlumnoGrupoDTO;
import es.daw2.fct_fct.dto.PosiblesEmpresasDTO;
import es.daw2.fct_fct.modelo.Alumno;
import es.daw2.fct_fct.modelo.CicloLectivo;
import es.daw2.fct_fct.modelo.Curso;
import es.daw2.fct_fct.modelo.Grupo;
import es.daw2.fct_fct.servicio.ServicioAlumno;
import es.daw2.fct_fct.servicio.ServicioCicloLectivo;
import es.daw2.fct_fct.servicio.ServicioCurso;
import es.daw2.fct_fct.servicio.ServicioGrupo;
import es.daw2.fct_fct.servicio.ServicioUser;
import es.daw2.fct_fct.utils.Role;
import es.daw2.fct_fct.utils.SessionsManager;
import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/cursos")
public class ControladorCurso extends CrudController<Long, Curso, Curso, Curso, ServicioCurso> {

    @Override
    public ResponseEntity<?> create(@RequestBody Curso c, HttpServletRequest request) {
        service.save(c);
        
        URI location = URI.create("/listarCursosId" +c.getId());
        return ResponseEntity.created(location).body(c);
    }

    @Autowired
    private ServicioGrupo servicioGrupo;
    @Autowired
    private ServicioAlumno servicioAlumno;
    @Autowired
    private ServicioCicloLectivo servicioCicloLectivo;

    @PostMapping("/alumno")
    public ResponseEntity<?> addAlumnoToGrupo(@RequestBody AlumnoGrupoDTO dto, HttpServletRequest request) {
        System.out.println("DTO: " + dto);

        Optional<CicloLectivo> clopt = servicioCicloLectivo.getById(dto.idCicloLectivo());
        if (clopt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        System.out.println("Ciclo Lectivo: " + clopt.get());

        Optional<Grupo> grupoOpt = servicioGrupo.getById(dto.idGrupo());
        if (grupoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Grupo grupo = grupoOpt.get();
        System.out.println("Grupo: " + grupo);

        Optional<Alumno> alumnoOpt = servicioAlumno.getById(dto.idAlumno());
        if (alumnoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Alumno alumno = alumnoOpt.get();
        System.out.println("Alumno: " + alumno);

        List<Long> lg = servicioGrupo.list()
            .stream()
            .filter(g -> g.getCicloLectivo().getId().equals(dto.idCicloLectivo()))
            .map(Grupo::getId)
            .toList();

        Optional<Curso> cursoOpt = service.list()
            .stream()
            .filter(c -> lg.contains(c.getGrupo().getId()) && c.getAlumno().getId().equals(alumno.getId()))
            .findFirst();
        
        if (cursoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("El alumno ya está asignado al grupo en un ciclo lectivo.");
        }

        Curso curso = new Curso();
        curso.setGrupo(grupo);
        curso.setAlumno(alumno);
        curso.setHorasHechas((short) 0);
        curso.setRating("VERDE");
        curso.setPosiblesEmpresas("");
        curso.setObservaciones("");

        service.save(curso);
        return ResponseEntity.ok(grupo);
    }

    // all ya existe en CrudController

    // getById ya existe en CrudController

    @Override
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Curso c, HttpServletRequest request) {
        Optional<Curso> optional = service.getById(id);

        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        c.setId(id);

        Optional<Curso> cursoActualizado = service.update(id, c);
        if (!cursoActualizado.isPresent()) {
            return ResponseEntity.badRequest().body("No se ha podido actualizar el curso con el id: " + id);
        }

        URI location = URI.create("/listarCursosId" + c.getId());

        return ResponseEntity.created(location).body(cursoActualizado);
    }

    // delete ya existe en CrudController

    @DeleteMapping("/delete")
    ResponseEntity<?> delete(@RequestBody AlumnoGrupoDTO dto, HttpServletRequest request) {
        Optional<Grupo> grupoOpt = servicioGrupo.getById(dto.idGrupo());
        if (grupoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Alumno> alumnoOpt = servicioAlumno.getById(dto.idAlumno());
        if (alumnoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long id = service.getIdByGrupoAndAlumno(dto.idGrupo(), dto.idAlumno());

        boolean deleted = service.delete(id);
        if (!deleted) return ResponseEntity.badRequest().body("No se ha podido eliminar el recurso con el id: " + id);
        return ResponseEntity.noContent().build();
    }

    @Autowired
    private ServicioUser servicioUser;

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AlumnoActualizarCursoDTO a, HttpServletRequest request) {
        Optional<Curso> cursoOptional = service.getById(id);
        if (cursoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Curso curso = cursoOptional.get();

        curso.setRating(a.rating() == null ? "VERDE" : a.rating());
        curso.setObservaciones(a.observaciones() == null ? "" : a.observaciones());

        Optional<Alumno> optional = servicioAlumno.getById(curso.getAlumno().getId());

        if(!optional.isPresent()){
            return ResponseEntity.notFound().build();
        }

        Alumno alumno = optional.get();

        alumno.getUser().setName(a.name());
        alumno.getUser().setEmail(a.email());
        servicioUser.update(alumno.getUser().getId(), alumno.getUser());

        alumno.setPhone(a.phone());
        alumno.setNia(a.nia());
        alumno.setDni(a.dni());
        alumno.setNuss(a.nuss());
        alumno.setAddress(a.address());
        alumno.setConvocatoria(a.convocatoria() == null ? 3 : a.convocatoria());

        Optional<Alumno> alumnoActualizado = servicioAlumno.update(alumno.getId(), alumno);
        if (!alumnoActualizado.isPresent()) {
            return ResponseEntity.badRequest().body("No se ha podido actualizar el alumno con el id: " + id);
        }

        URI location = URI.create("/api/cursos/" + id);

        return ResponseEntity.ok().location(location).body(alumnoActualizado);
    }

    @PutMapping("/posibles-empresas/{cursoId}")
    public ResponseEntity<?> posiblesEmpresas(@PathVariable Long cursoId, @RequestBody PosiblesEmpresasDTO dto, HttpServletRequest request) {
        Optional<Curso> cursoOpt = service.getById(cursoId);
        if (cursoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Curso curso = cursoOpt.get();
        curso.setPosiblesEmpresas(dto.posiblesEmpresas() == null ? "" : dto.posiblesEmpresas());

        Optional<Curso> updatedCurso = service.update(cursoId, curso);
        System.out.println("Curso actualizado: " + updatedCurso);
        if (!updatedCurso.isPresent()) {
            return ResponseEntity.badRequest().body("No se ha podido actualizar el curso con el id: " + cursoId);
        }

        URI location = URI.create("/api/cursos/" + cursoId);
        return ResponseEntity.ok().location(location).body(updatedCurso);
    }

    @GetMapping("/alumno")
    public ResponseEntity<?> getCursosByAlumno(HttpServletRequest request) {
        SessionsManager.isValidSession(request, Role.ALUMNO);
        Long alumnoId = (Long) request.getSession().getAttribute("child_id");
        List<Curso> cursos = service.list()
            .stream()
            .filter((curso) -> curso.getAlumno().getId() == alumnoId)
            .collect(Collectors.toList());

        if (cursos.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(cursos);
    }
}
