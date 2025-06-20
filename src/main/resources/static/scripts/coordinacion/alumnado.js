window.addEventListener('DOMContentLoaded', (event) => {
    promise();
});

function promise() {
    Promise.all([
        fetchCiclosLectivos(),
        fetchGruposCiclos(),
        fetchAlumnos()
    ])
    .then(([
        ciclosLectivos,
        gruposCiclos,
        alumnos
    ]) => {
        build(ciclosLectivos, gruposCiclos, alumnos);
    }).catch((error) => {
        console.error('Error al obtener los ciclos lectivos:', error);
    })
}

async function fetchCiclosLectivos() {
    const response = await fetch('/api/ciclos-lectivos/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Error al obtener los ciclos lectivos');
    return await response.json();
}

async function fetchGruposCiclos() {
    const response = await fetch('/api/vista-grupos-ciclos/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Error al obtener los grupos');
    return await response.json();
}

async function fetchAlumnos() {
    const response = await fetch('/api/vista-alumnos/all');
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Error al obtener los alumnos');
    return await response.json();
}

const info = [];
let chosenCicloLectivo = null;
let chosenGrupo = null;

let ciclosLectivos = [];
let gruposCiclos = [];

function build(ciclosLectivos, gruposCiclos, alumnos) {
    ciclosLectivos.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    console.log(ciclosLectivos, gruposCiclos, alumnos);
    ciclosLectivos.forEach((cicloLectivo) => {
        info.push({
            id: cicloLectivo.id,
            createdAt: cicloLectivo.createdAt,
            updatedAt: cicloLectivo.updatedAt,
            nombre: cicloLectivo.nombre,
            fechaInicio: cicloLectivo.fechaInicio,
            grupos: gruposCiclos.filter(grupo => grupo.cicloLectivoId === cicloLectivo.id).map(grupo => {
                return {
                    cicloLectivoId: grupo.cicloLectivoId,
                    grupoId: grupo.grupoId,
                    grupoNombre: grupo.grupoNombre,
                    ciclo_id: grupo.cicloId,
                    alumnos: alumnos.filter(alumno => alumno.grupoId === grupo.grupoId)
                };
            })
        })
    });
    console.log(info);

    createCiclosLectivos();
}

function createCiclosLectivos() {
    const cicloLectivoSelection = document.getElementById('ciclo-lectivo-selection');
    cicloLectivoSelection.innerHTML = '';

    if (info.length === 0) {
        cicloLectivoSelection.classList.add('empty');
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No hay ciclos lectivos disponibles';
        cicloLectivoSelection.appendChild(emptyMessage);
        return;
    }

    info.forEach((cicloLectivo) => {
        const div = document.createElement('div');
        div.classList.add('item');
        cicloLectivoSelection.appendChild(div);

        const cicloLectivoText = document.createElement('p');
        cicloLectivoText.classList.add('item-text');
        cicloLectivoText.id = `ciclo-lectivo-${cicloLectivo.id}`;
        cicloLectivoText.textContent = cicloLectivo.nombre;
        div.appendChild(cicloLectivoText);

        div.addEventListener('click', () => {
            ciclosLectivos.forEach(item => item.classList.remove('active'));
            div.classList.add('active');
            chosenCicloLectivo = div;
            gruposCiclos.forEach(item => item.classList.remove('active'));
            chosenGrupo = null;
            createGruposCiclos(cicloLectivo.id);
        });

        if (chosenCicloLectivo === null) {
            div.classList.add('active');
            chosenCicloLectivo = div;
            createGruposCiclos(cicloLectivo.id);
        }

        ciclosLectivos.push(div);
    });
}

function createGruposCiclos(cicloLectivoId) {
    const gruposCiclosSelection = document.getElementById('grupos-ciclos-selection');
    gruposCiclosSelection.innerHTML = '';

    if (cicloLectivoId < 0) {
        gruposCiclosSelection.classList.add('empty');
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No hay grupos disponibles';
        gruposCiclosSelection.appendChild(emptyMessage);
        return;
    }

    const cicloLectivo = info.find(ciclo => ciclo.id === cicloLectivoId);
    if (cicloLectivo) {
        cicloLectivo.grupos.forEach((grupo) => {
            const div = document.createElement('div');
            div.classList.add('item');
            gruposCiclosSelection.appendChild(div);

            const grupoText = document.createElement('p');
            grupoText.classList.add('item-text');
            grupoText.id = `grupo-${grupo.grupoId}`;
            grupoText.textContent = grupo.grupoNombre;
            div.appendChild(grupoText);

            div.addEventListener('click', () => {
                gruposCiclos.forEach(item => item.classList.remove('active'));
                div.classList.add('active');
                chosenGrupo = div;
                createAlumnos(grupo.alumnos);
            });

            if (chosenGrupo === null) {
                div.classList.add('active');
                chosenGrupo = div;
                createAlumnos(grupo.alumnos);
            }

            gruposCiclos.push(div);
        });
    }
}

function createAlumnos(alumnos) {
    const alumnosSelection = document.getElementById('alumnos-list');
    alumnosSelection.innerHTML = '';

    alumnos.forEach(alumno => {
        const alumnoElement = document.createElement('div');
        alumnoElement.classList.add('alumno', 'cell');
        alumnoElement.id = `alumno-${alumno.id}`;

        const nameElement = document.createElement('p');
        nameElement.innerHTML = `Nombre: <span class="alumno-nombre">${alumno.nombreAlumno}</span>`;
        alumnoElement.appendChild(nameElement);

        const niaElement = document.createElement('p');
        niaElement.innerHTML = `NIA: <span class="alumno-nia">${alumno.nia}</span>`;
        alumnoElement.appendChild(niaElement);

        const emailElement = document.createElement('p');
        emailElement.innerHTML = `Correo: <span class="alumno-email">${alumno.email}</span>`;
        alumnoElement.appendChild(emailElement);

        alumnosSelection.appendChild(alumnoElement);
    });
}
