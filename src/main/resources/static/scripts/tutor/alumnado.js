import { Form } from '../classes/Form.js';
import { tableLoading, tableFail, createSVG, createClickableSVG } from '../functions.js';

const SECTION = 'curso-actual';

window.addEventListener('FormsCreated', (event) => {
    promise();
    const form = Form.getForm('alumno-form');
    form.getInput('nia').validate = function () {
        if (this.input.value.trim().length === 0) return true;
        let nia = this.input.value.trim().toUpperCase();
        return /^\d{8}$/.test(nia);
    }
    form.getInput('nia').getValue = function () {
        let nia = this.input.value.trim().toUpperCase();
        return nia.length === 0 ? null : nia;
    }
    form.getInput('nuss').validate = function () {
        if (this.input.value.trim().length === 0) return true;
        let nuss = this.input.value.trim().toUpperCase();
        return /^\d{11}$/.test(nuss);
    }
    form.getInput('nuss').getValue = function () {
        let nuss = this.input.value.trim().toUpperCase();
        return nuss.length === 0 ? null : nuss;
    }
});

function promise() {
    Promise.all([
        fetchAlumnos()
    ])
    .then(([
        alumnos
    ]) => {
        build(alumnos);
    }).catch((error) => {
        console.error('Error al obtener los alumnos:', error);
    });
}

async function fetchAlumnos() {
    const response = await fetch('/api/vista-all-alumnos/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Error al obtener los alumnos');
    return await response.json();
}

function build(alumnos) {
    console.log('Alumnos:', alumnos);

    const form = Form.getForm('alumno-form');

    const asignar = Form.getForm('alumno-search-form');
    const searchInput = asignar.getInput('search');
    if (searchInput) {
        const searchDo = () => {
            let query = searchInput.input.value;
            query = (query || '').toLowerCase().trim();
            let options = [];
            
            alumnos.forEach(alumno => {
                const [ name, email, nia, dni ] = [alumno.nombreAlumno, alumno.email, alumno.nia, alumno.dni];
                const values = [
                    (name || '').toLowerCase(),
                    (email || '').toLowerCase(),
                    (nia || '').toLowerCase(),
                    (dni || '').toLowerCase()
                ];
                const match = values.some(val => val.includes(query));
                if (match) {
                    options.push({
                        value: alumno.alumnoId,
                        label: `${name} (${nia}) - ${email} - ${dni}`
                    });
                }
            });
            searchInput.updateDropdown(options, true);
        }

        searchInput.input.addEventListener('input', searchDo);
        searchInput.input.addEventListener('focus', searchDo);
    }

    setInputsToCreate(form);
}

function setInputsToCreate(form) {
    document.getElementById('titulo').textContent = 'Creación de un nuevo alumno';

    form.onsubmit = () => {
        const nombre = form.getInput('nombre').getValue();
        const email = form.getInput('email').getValue();
        const phone = form.getInput('phone').getValue();
        const nia = form.getInput('nia').getValue();
        const dni = form.getInput('dni').getValue();
        const nuss = form.getInput('nuss').getValue();
        const address = form.getInput('address').getValue();
        const convocatoria = form.getInput('convocatoria').getValue();

        let newAlumno = {
            nombreAlumno: nombre,
            email: email,
            dni: dni,
            nia: nia,
            nuss: nuss,
            phone: phone,
            address: address,
            convocatoria: convocatoria
        };

        fetch('/api/alumnos/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAlumno)
        })
        .then(response => {
            if (response.status === 201) {
                promise();
                form.reset();
                form.submitFinish();
                form.showSuccess('Alumno creado correctamente');
            } else {
                form.showError('Error al crear el alumno');
            }
        })
        .catch(error => {
            form.showError('Error al enviar los datos: ' + error.message);
        });
    };

    form.getInput('nombre').retrack('');
    form.getInput('email').retrack('');
    form.getInput('phone').retrack('');
    form.getInput('nia').retrack('');
    form.getInput('dni').retrack('');
    form.getInput('nuss').retrack('');
    form.getInput('address').retrack('');
    form.getInput('convocatoria').retrack('');

    form.form.querySelector('.submit-button').textContent = 'Crear alumno';
}
