package es.daw2.fct_fct.modelo;

import javax.validation.constraints.Email;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tutores_empresas")
public class Tutor_empresa {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "empresa_id")
    private Empresas empresas;

    @Column(name = "nombre", nullable = false, columnDefinition = "VARCHAR(255)")
    private String nombre;

    @Email(regexp = ".+@.+\\..+")
    @Column(name = "email", nullable = false, columnDefinition = "VARCHAR(255)")
    private String email;

    @Column(name = "telefono", nullable = false, columnDefinition = "VARCHAR(15)")
    private String telefono;

    @Column(name = "dni", nullable = false, columnDefinition = "VARCHAR(9)")
    private String dni;
}
