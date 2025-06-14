import { Form } from '../classes/Form.js';

if (!HTMLInputElement.prototype.isEmpty) {
    HTMLInputElement.prototype.isEmpty = function() {
        return !this.value || this.value.trim() === '';
    };
}
if (!HTMLSelectElement.prototype.isEmpty) {
    HTMLSelectElement.prototype.isEmpty = function() {
        return !this.value || this.value.trim() === '';
    };
}
if (!HTMLTextAreaElement.prototype.isEmpty) {
    HTMLTextAreaElement.prototype.isEmpty = function() {
        return !this.value || this.value.trim() === '';
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-empresa-btn');
    if (addBtn) {
        addBtn.addEventListener('click', addEmpresa);
    }
    cargarEmpresas();
});

function cargarEmpresas() {
    mostrarCargando();
    console.log("Cargando empresas y alumnos...");
    Promise.all([
        fetchEmpresas(),
        fetchAlumnos()
    ])
    .then(([
        empresas,
        alumnos
    ]) => {
        console.log("Empresas:", empresas);
        console.log("Alumnos:", alumnos);
        dibujarTabla(empresas, alumnos);
        tutoresEmpresas(empresas);
    }).catch((error) => {
        mostrarError();
        console.error(error);
    });
}

function tutoresEmpresas(empresas) {
    const form = Form.getForm('tutores-empresas-form');
    const tutorSearch = form.getInput('search-empresa');
    const tutorNombre = form.getInput('tutor-nombre');
    const tutorEmail = form.getInput('tutor-email');
    const tutorTel = form.getInput('tutor-tel');
    const tutorDni = form.getInput('tutor-dni');

    const searchDo = () => {
        let query = tutorSearch.input.value;
        query = (query || '').toLowerCase().trim();
        let options = [];

        empresas.forEach(empresa => {
            const [ nombre, cif, email ] = [empresa.nombre, empresa.cif, empresa.email];
            const values = [
                (nombre || '').toLowerCase(),
                (cif || '').toLowerCase(),
                (email || '').toLowerCase()
            ];

            const match = values.some(val => val.includes(query));
            if (match) {
                options.push({
                    value: empresa.empresaId,
                    label: `${nombre} (${cif ? cif : 'Sin CIF'}) - ${email ? email : 'Sin email'}`,
                });
            }
        });
        tutorSearch.updateDropdown(options, true);
    }

    tutorSearch.input.addEventListener('input', searchDo);
    tutorSearch.input.addEventListener('focus', searchDo);

    form.onsubmit = () => {
        const data = {
            empresaId: tutorSearch.getValue(),
            nombre: tutorNombre.getValue(),
            email: tutorEmail.getValue(),
            telefono: tutorTel.getValue(),
            dni: tutorDni.getValue()
        }

        fetch('/api/tutores-empresas/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then((response) => {
            if (response.status === 201) {
                form.showSuccess('Tutor de empresa creado con éxito.');
            } else {
                form.showError('Error al crear el tutor de empresa. Por favor, revisa los datos introducidos.');
            }
        })
        .catch((error) => {
            form.showError('Error al crear el tutor de empresa. Por favor, revisa los datos introducidos.');
        })
        .finally(() => {
            form.submitFinish();
        });
    }
}

async function fetchEmpresas() {
    const response = await fetch('/api/vista-empresas-tutores/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('No se encontraron empresas');
    return await response.json();
}

async function fetchAlumnos() {
    const response = await fetch('/api/vista-all-alumnos/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Error al obtener los alumnos');
    return await response.json();
}

function mostrarCargando() {
    const wrapper = document.getElementById('display-grid-wrapper');
    wrapper.innerHTML = "";
    const spinner = document.createElement('div');
    spinner.classList.add('spinner', 'spinner-border', 'text-primary');
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    wrapper.appendChild(spinner);
}

function mostrarError() {
    const wrapper = document.getElementById('display-grid-wrapper');
    wrapper.innerHTML = "";
    const errorMessageSection = document.createElement('div');
    errorMessageSection.id = 'error-message-section';
    errorMessageSection.innerHTML = `
        <svg class="cross-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path d="M 40.9706 35.3137 L 29.6569 24 L 40.9706 12.6863 C 42.3848 11.2721 42.3848 8.4437 40.9706 7.0294 S 36.7279 5.6152 35.3137 7.0294 L 24 18.3431 L 12.6863 7.0294 C 11.2721 5.6152 8.4437 5.6152 7.0294 7.0294 S 5.6152 11.2721 7.0294 12.6863 L 18.3431 24 L 7.0294 35.3137 C 5.6152 36.7279 5.6152 39.5563 7.0294 40.9706 S 11.2721 42.3848 12.6863 40.9706 L 24 29.6569 L 35.3137 40.9706 C 36.7279 42.3848 39.5563 42.3848 40.9706 40.9706 S 42.3848 36.7279 40.9706 35.3137 Z"/>
        </svg>
    `;
    wrapper.appendChild(errorMessageSection);
}

function dibujarTabla(empresas, alumnos) {
    const wrapper = document.getElementById('display-grid-wrapper');
    wrapper.innerHTML = "";

    // Agrupar empresas por estado
    const estados = {
        pendiente: [],
        denegado: [],
        aceptado: []
    };
    empresas.forEach(e => {
        const estado = (e.estado || '').toLowerCase();
        if (estado === 'pendiente') estados.pendiente.push(e);
        else if (estado === 'denegado') estados.denegado.push(e);
        else if (estado === 'aceptado') estados.aceptado.push(e);
    });

    // Helper para crear cada bloque
    function crearBloqueEstado(titulo, lista) {
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'grid-wrapper collapsible-wrapper';

        // Cabecera clickable
        const header = document.createElement('div');
        header.className = 'collapsible-header';
        header.tabIndex = 0;
        header.innerHTML = `<h4>${titulo} <span class="collapsible-arrow">&#9654;</span></h4>`;

        // Contenido colapsable
        const content = document.createElement('div');
        content.className = 'collapsible-content';
        content.appendChild(crearGridEmpresas(lista, alumnos));

        // Evento para expandir/colapsar
        header.addEventListener('click', () => {
            content.classList.toggle('active');
            header.querySelector('.collapsible-arrow').classList.toggle('rotated');
        });

        gridWrapper.appendChild(header);
        gridWrapper.appendChild(content);
        return gridWrapper;
    }

    // Tabla para cada estado
    if (estados.pendiente.length > 0) {
        wrapper.appendChild(crearBloqueEstado('Empresas pendientes', estados.pendiente));
    }
    if (estados.aceptado.length > 0) {
        wrapper.appendChild(crearBloqueEstado('Empresas aceptadas', estados.aceptado));
    }
    if (estados.denegado.length > 0) {
        wrapper.appendChild(crearBloqueEstado('Empresas denegadas', estados.denegado));
    }

    const form = Form.getForm('empresa-form');
    const searchInput = form.getInput('propuesta_por');
    if (searchInput) {
        searchInput.input.addEventListener('input', () => {
            let query = searchInput.input.value;
            query = (query || '').toLowerCase().trim();
            console.log(query);
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
                console.log(match, values);
                console.log(options);
                if (match) {
                    options.push({
                        value: alumno.userId,
                        label: `${name} (${nia}) - ${email} - ${dni}`
                    });
                }
            });
            searchInput.updateDropdown(options, true);
        });
    }
}

function crearTituloTabla(texto) {
    const h = document.createElement('h4');
    h.textContent = texto;
    h.style.margin = "20px 0 10px 0";
    return h;
}

function crearGridEmpresas(empresas, alumnos) {
    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'cif', label: 'CIF' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
        { key: 'sector', label: 'Sector' },
        { key: 'address', label: 'Dirección' },
        { key: 'hay_convenio', label: 'Convenio' },
        { key: 'numero_convenio', label: 'Número Convenio' },
        { key: 'numero_plazas', label: 'Número Plazas' },
        { key: 'fecha_contacto', label: 'Fecha Contacto' },
        { key: 'persona_contacto', label: 'Persona Contacto' },
        { key: 'propuesta_por', label: 'Propuesta por' },
        { key: 'observaciones', label: 'Observaciones' }
    ];

    const alumnoMap = {};
    if (alumnos && Array.isArray(alumnos)) {
        alumnos.forEach(a => {
            alumnoMap[a.userId] = a;
        });
    }

    const gridData = document.createElement('div');
    gridData.className = 'grid-data';
    gridData.id = ''; // No id para evitar duplicados

    // Cabecera
    columns.forEach((col, idx) => {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'cell-column-header');
        cell.style.gridRow = '1';
        cell.style.gridColumn = `${idx + 1}`;
        cell.textContent = col.label;
        gridData.appendChild(cell);
    });
    // Cabecera acciones
    const cellAcciones = document.createElement('div');
    cellAcciones.classList.add('cell', 'cell-column-header');
    cellAcciones.style.gridRow = '1';
    cellAcciones.style.gridColumn = `${columns.length + 1}`;
    cellAcciones.textContent = 'Acciones';
    gridData.appendChild(cellAcciones);

    // Filas de empresas
    empresas.forEach((empresa, rowIdx) => {
        columns.forEach((col, colIdx) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.gridRow = `${rowIdx + 2}`;
            cell.style.gridColumn = `${colIdx + 1}`;
            
            if (col.key === 'propuesta_por') {
                const alumno = alumnoMap[empresa.propuesta_por];
                cell.textContent = alumno ? `${alumno.nombreAlumno} (${alumno.nia})` : '';
            } else if (col.key === 'hay_convenio') {
                // Si hay número de convenio, muestra un check
                cell.textContent = empresa.numero_convenio && empresa.numero_convenio.trim() !== '' ? '✔️' : '';
            } else {
                cell.textContent = empresa[col.key] || '';
            }

            gridData.appendChild(cell);
        });

        const cellActions = document.createElement('div');
        cellActions.classList.add('cell');
        cellActions.style.gridRow = `${rowIdx + 2}`;
        cellActions.style.gridColumn = `${columns.length + 1}`;

        // Botón editar
        cellActions.appendChild(createSVG(
            '0 -0.5 25 25',
            'M 20.848 1.879 C 19.676 0.707 17.777 0.707 16.605 1.879 L 2.447 16.036 C 2.029 16.455 1.743 16.988 1.627 17.569 L 1.04 20.505 C 0.76 21.904 1.994 23.138 3.393 22.858 L 6.329 22.271 C 6.909 22.155 7.443 21.869 7.862 21.451 L 22.019 7.293 C 23.191 6.121 23.191 4.222 22.019 3.05 L 20.848 1.879 Z M 18.019 3.293 C 18.41 2.902 19.043 2.902 19.433 3.293 L 20.605 4.465 C 20.996 4.855 20.996 5.488 20.605 5.879 L 6.447 20.036 C 6.308 20.176 6.13 20.271 5.936 20.31 L 3.001 20.897 L 3.588 17.962 C 3.627 17.768 3.722 17.59 3.862 17.451 L 13.933 7.379 L 16.52 9.965 L 17.934 8.56 L 15.348 5.965 L 18.019 3.293 Z',
            () => editEmpresa(empresa),
            'edit-svg'
        ));

        // Botón eliminar
        cellActions.appendChild(createSVG(
            '-6 -6 60 60',
            'M 42 3 H 28 A 2 2 0 0 0 26 1 H 22 A 2 2 0 0 0 20 3 H 6 A 2 2 0 0 0 6 7 H 42 A 2 2 0 0 0 42 3 Z M 37 11 V 43 H 31 V 19 A 1 1 0 0 0 27 19 V 43 H 21 V 19 A 1 1 0 0 0 17 19 V 43 H 11 V 11 A 2 2 0 0 0 7 11 V 45 A 2 2 0 0 0 9 47 H 39 A 2 2 0 0 0 41 45 V 11 A 2 2 0 0 0 37 11 Z',
            () => removeEmpresa(empresa),
            'delete-svg'
        ));

        gridData.appendChild(cellActions);
    });

    // Ajustar grid
    gridData.style.display = 'grid';
    gridData.style.gridTemplateRows = `repeat(${empresas.length + 1}, auto)`;
    gridData.style.gridTemplateColumns = `repeat(${columns.length}, minmax(80px, auto)) 80px`;

    return gridData;
}

function createSVG(viewBox, pathData, clickHandler, ...classList) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('xmlns', SVG_NS);
    classList.forEach(cls => svg.classList.add(cls));
    svg.addEventListener('click', clickHandler);

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);

    return svg;
}

function hideAll() {
    const form = document.getElementById('empresa-form');
    const section = document.getElementById('empresa-section');
    if (section) section.classList.add('oculto');
}

function finish(form) {
    form.reset();
    if (typeof form.submitFinish === 'function') form.submitFinish();
    hideAll();
    document.getElementById('display-section').classList.remove('oculto');
    cargarEmpresas();
}

const estadosPosibles = {
    PENDIENTE: 'Pendiente',
    ACEPTADO: 'Aprobado',
    DENEGADO: 'Denegado'
}

function editEmpresa(empresa) {
    hideAll();

    const section = document.getElementById('empresa-section');
    section.classList.remove('oculto');

    const form = Form.getForm('empresa-form');

    // Rellenar campos
    form.getInput('empresa-nombre').retrack(empresa.nombre);
    form.getInput('empresa-cif').retrack(empresa.cif);
    form.getInput('empresa-sector').retrack(empresa.sector);
    form.getInput('empresa-address').retrack(empresa.address);
    form.getInput('empresa-telefono').retrack(empresa.phone);
    form.getInput('empresa-email').retrack(empresa.email);
    form.getInput('persona_contacto').retrack(empresa.persona_contacto);
    form.getInput('numero_convenio').retrack(empresa.numero_convenio);
    form.getInput('numero_plazas').retrack(empresa.numero_plazas);
    form.getInput('fecha_contacto').retrack(empresa.fecha_contacto ? new Date(empresa.fecha_contacto).toISOString().split('T')[0] : '');
    form.getInput('observaciones').retrack(empresa.observaciones);
    form.getInput('propuesta_por').retrack(empresa.propuesta_por);

    // Selector de estado
    const estadoSelect = document.getElementById('empresa-estado');
    if (estadoSelect && empresa.estado) {
        estadoSelect.value = empresa.estado;
    }

    form.form.setAttribute('submit-text', 'Actualizar empresa');
    form.submit.textContent = 'Actualizar empresa';

    form.onsubmit = () => {

        const estadoSelect = document.getElementById('empresa-estado');
        const data = {
            empresaId: empresa.empresaId || empresa.id,
            nombre: form.getInput('empresa-nombre').getValue(),
            cif: form.getInput('empresa-cif').getValue(),
            sector: form.getInput('empresa-sector').getValue(),
            address: form.getInput('empresa-address').getValue(),
            phone: form.getInput('empresa-telefono').getValue(),
            email: form.getInput('empresa-email').getValue(),
            persona_contacto: form.getInput('persona_contacto').getValue(),
            propuesta_por: form.getInput('propuesta_por').getValue() ? parseInt(form.getInput('propuesta_por').getValue(), 10) : null,
            observaciones: form.getInput('observaciones').getValue(),
            numero_convenio: form.getInput('numero_convenio').getValue(),
            numero_plazas: form.getInput('numero_plazas').getValue(),
            fecha_contacto: form.getInput('fecha_contacto').getValue() ? new Date(form.getInput('fecha_contacto').getValue()).toISOString().split('T')[0] : null,
            estado: form.getInput('empresa-estado').getValue(),
            tutor_empresaId: empresa.tutor_empresaId || null,
            nombre_tutor: empresa.nombre_tutor || null,
            userId: empresa.userId || null,
            nombre_usuario: empresa.nombre_usuario || null
        };

        fetch(`/api/vista-empresas-tutores/completo/${empresa.empresaId || empresa.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                finish(form);
            } else {
                response.text().then(text => {
                    form.showError(`Error al actualizar la empresa: ${text}`);
                });
            }
        })
        .catch(error => {
            console.error('Error al actualizar la empresa:', error);
            form.showError('Error al actualizar la empresa');
        });
    };
}

function removeEmpresa(empresa) {
    if (!confirm(`¿Estás seguro de que quieres eliminar la empresa "${empresa.nombre}"?`)) {
        return;
    }

    fetch(`/api/empresa/${empresa.empresaId || empresa.id}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            cargarEmpresas();
        } else {
            response.text().then((text) => {
                alert(`Error al eliminar la empresa: ${text}`);
            });
        }
    }).catch(error => {
        console.error('Error al eliminar la empresa:', error);
        alert('Error al eliminar la empresa');
    });
}

function addEmpresa() {
    hideAll();
    
    const section = document.getElementById('empresa-section');
    section.classList.remove('oculto');

    const form = Form.getForm('empresa-form');

    form.onsubmit = () => {
        hideAll();
        const form = Form.getForm('empresa-form');
        section.classList.remove('oculto');

        form.form.setAttribute('submit-text', 'Crear empresa');
        form.submit.textContent = 'Crear empresa';

        const data = {
            nombre: form.getInput('empresa-nombre').getValue(),
            cif: form.getInput('empresa-cif').getValue(),
            sector: form.getInput('empresa-sector').getValue(),
            address: form.getInput('empresa-address').getValue(),
            phone: form.getInput('empresa-telefono').getValue(),
            email: form.getInput('empresa-email').getValue(),
            persona_contacto: form.getInput('persona_contacto').getValue(),
            propuesta_por: null,
            observaciones: form.getInput('observaciones').getValue(),
            numero_convenio: form.getInput('numero_convenio').getValue(),
            numero_plazas: form.getInput('numero_plazas').getValue() ? parseInt(form.getInput('numero_plazas').getValue(), 10) : null,
            fecha_contacto: form.getInput('fecha_contacto').getValue() ? new Date(form.getInput('fecha_contacto').getValue()).toISOString().split('T')[0] : null,
            estado: form.getInput('empresa-estado').getValue()
        };

        fetch('/api/empresa/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok || response.status === 201) {
                finish(form);
            } else {
                response.text().then((text) => {
                    form.showError(`Error al crear la empresa: ${text}`);
                });
            }
        }).catch(error => {
            console.error('Error al crear la empresa:', error);
            form.showError('Error al crear la empresa');
        });
    };

    // Resetea los campos del formulario
    form.getInput('empresa-nombre').retrack('');
    form.getInput('empresa-cif').retrack('');
    form.getInput('empresa-sector').retrack('');
    form.getInput('empresa-address').retrack('');
    form.getInput('empresa-telefono').retrack('');
    form.getInput('empresa-email').retrack('');
    form.getInput('persona_contacto').retrack('');
    form.getInput('numero_convenio').retrack('');
    form.getInput('numero_plazas').retrack('');
    form.getInput('fecha_contacto').retrack('');
    form.getInput('observaciones').retrack('');
    form.getInput('propuesta_por').retrack('');
    form.getInput('empresa-estado').retrack('');

    form.form.setAttribute('submit-text', 'Crear empresa');
    form.submit.textContent = 'Crear empresa';
}
