package es.daw2.fct_fct.modelo;

import java.time.LocalDateTime;

import es.daw2.fct_fct.utils.Role;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Data
@EqualsAndHashCode(callSuper = true)    // Se asegura de que la ID esté incluida en la comparación
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="users")
@AttributeOverride(name = "id", column = @Column(name = "user_id", nullable = false, columnDefinition = "BIGINT"))
public class User extends AbsBaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "ENUM('ADMIN', 'TUTOR', 'COORDINADOR', 'ALUMNO')")
    private Role role;

    @Column(name = "name", nullable = false, columnDefinition = "varchar(255)")
    private String name;

    @Email(regexp = ".+@.+\\..+")
    @Column(name = "email", nullable = false, columnDefinition = "varchar(255)")
    private String email;

    @Column(name = "password", nullable = false, columnDefinition = "varchar(255)")
    private String password;

    @Column(name = "updated_password_at", nullable = true, columnDefinition = "DATETIME DEFAULT NULL")
    private LocalDateTime updatedPasswordAt;
}
