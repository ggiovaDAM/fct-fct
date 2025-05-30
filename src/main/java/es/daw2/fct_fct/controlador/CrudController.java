package es.daw2.fct_fct.controlador;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Abstract controller for CRUD operations.
 * Contains the basic structure for creation, grouped retrieval, singular retrieval, updating, and deletion of resources.
 * Has 3 generic types:
 * - Id: Type of the identifier type for the resource.
 * - C: Type of the DTO/Object for creation.
 * - U: Type of the DTO/Object for updating.
 */
public abstract class CrudController<Id, C, U> {
    // Crud
    @PostMapping("/create")
    ResponseEntity<?> create(@RequestBody C dto) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Create operation is not supported");
    }

    // cRud
    @GetMapping("/all")
    ResponseEntity<?> all() throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Get all operation is not supported");
    }

    // cRud
    @GetMapping("/{id}")
    ResponseEntity<?> getById(@PathVariable Id id) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Get by ID operation is not supported");
    }

    // crUd
    @PostMapping("/{id}")
    ResponseEntity<?> update(@PathVariable Id id, @RequestBody U dto) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Update operation is not supported");
    }

    // cruD
    @DeleteMapping("/{id}")
    ResponseEntity<?> delete(@PathVariable Id id) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Delete operation is not supported");
    }
}
