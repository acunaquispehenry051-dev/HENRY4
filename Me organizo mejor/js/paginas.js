"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // Funciones comunes para leer y guardar datos.

    function leer(clave) {
        try {
            const texto = localStorage.getItem(clave);

            if (!texto) {
                return [];
            }

            const datos = JSON.parse(texto);

            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            console.error("Error al leer " + clave, error);
            return [];
        }
    }

    function guardar(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error("Error al guardar " + clave, error);
            alert("No se pudieron guardar los datos en este navegador.");
            return false;
        }
    }

    function crearId() {
        if (window.crypto && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return Date.now().toString(36) +
            Math.random().toString(36).slice(2);
    }

    function crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function fechaValida(fecha) {
        if (!fecha) {
            return true;
        }

        const formato = /^\d{4}-\d{2}-\d{2}$/;

        if (!formato.test(fecha)) {
            return false;
        }

        const [anio, mes, dia] = fecha.split("-").map(Number);
        const fechaReal = new Date(anio, mes - 1, dia);

        return fechaReal.getFullYear() === anio &&
            fechaReal.getMonth() === mes - 1 &&
            fechaReal.getDate() === dia;
    }

    function fechaActual() {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    function mostrarFecha(fecha) {
        if (!fecha) {
            return "Sin fecha";
        }

        if (!fechaValida(fecha)) {
            return "Fecha no disponible";
        }

        const [anio, mes, dia] = fecha.split("-");

        return `${dia}/${mes}/${anio}`;
    }

    function mostrarMensaje(contenedor, mensaje) {
        contenedor.replaceChildren(
            crearElemento("p", "mensaje-vacio", mensaje)
        );
    }

    // ==============================
    // SISTEMA DE TAREAS
    // ==============================

    const formularioTarea = document.getElementById("formulario-tarea");

    if (formularioTarea) {
        const nombre = document.getElementById("nombre-tarea");
        const materia = document.getElementById("materia-tarea");
        const fecha = document.getElementById("fecha-tarea");
        const lista = document.getElementById("lista-tareas");
        const filtro = document.getElementById("filtro-tareas");
        const pendientes = document.getElementById("total-pendientes");
        const completadas = document.getElementById("total-completadas");

        fecha.min = fechaActual();

        function obtenerTareas() {
            return leer("misTareas").filter(tarea =>
                tarea &&
                typeof tarea.id === "string" &&
                typeof tarea.nombre === "string" &&
                typeof tarea.materia === "string" &&
                typeof tarea.fecha === "string" &&
                typeof tarea.completada === "boolean"
            );
        }

        function dibujarTareas() {
            const tareas = obtenerTareas();

            pendientes.textContent = tareas.filter(
                tarea => !tarea.completada
            ).length;

            completadas.textContent = tareas.filter(
                tarea => tarea.completada
            ).length;

            const seleccion = filtro.value;

            const visibles = tareas.filter(tarea => {
                if (seleccion === "pendientes") {
                    return !tarea.completada;
                }

                if (seleccion === "completadas") {
                    return tarea.completada;
                }

                return true;
            });

            lista.replaceChildren();

            if (visibles.length === 0) {
                mostrarMensaje(
                    lista,
                    tareas.length === 0
                        ? "Todavía no tienes tareas. ¡Agrega la primera!"
                        : "No hay tareas en esta categoría."
                );

                return;
            }

            visibles.sort((a, b) => a.fecha.localeCompare(b.fecha));

            visibles.forEach(tarea => {
                const tarjeta = crearElemento(
                    "article",
                    "elemento-lista" + (tarea.completada ? " completado" : "")
                );

                const informacion = crearElemento("div");
                informacion.appendChild(
                    crearElemento("h3", "", tarea.nombre)
                );
                informacion.appendChild(
                    crearElemento("p", "", "Materia: " + tarea.materia)
                );
                informacion.appendChild(
                    crearElemento("p", "", "Entrega: " + mostrarFecha(tarea.fecha))
                );

                const acciones = crearElemento("div", "acciones-lista");

                const botonCompletar = crearElemento(
                    "button",
                    "boton-pequeno boton-marcar",
                    tarea.completada ? "↩ Reabrir" : "✓ Completar"
                );

                botonCompletar.type = "button";

                botonCompletar.addEventListener("click", () => {
                    const actualizadas = obtenerTareas().map(item =>
                        item.id === tarea.id
                            ? { ...item, completada: !item.completada }
                            : item
                    );

                    if (guardar("misTareas", actualizadas)) {
                        dibujarTareas();
                    }
                });

                const botonBorrar = crearElemento(
                    "button",
                    "boton-pequeno boton-borrar",
                    "🗑 Eliminar"
                );

                botonBorrar.type = "button";

                botonBorrar.addEventListener("click", () => {
                    if (!confirm("¿Quieres eliminar esta tarea?")) {
                        return;
                    }

                    const actualizadas = obtenerTareas().filter(
                        item => item.id !== tarea.id
                    );

                    if (guardar("misTareas", actualizadas)) {
                        dibujarTareas();
                    }
                });

                acciones.append(botonCompletar, botonBorrar);
                tarjeta.append(informacion, acciones);
                lista.appendChild(tarjeta);
            });
        }

        formularioTarea.addEventListener("submit", evento => {
            evento.preventDefault();

            const nombreNuevo = nombre.value.trim();
            const materiaNueva = materia.value;
            const fechaNueva = fecha.value;

            if (!nombreNuevo || !materiaNueva || !fechaNueva) {
                alert("Completa todos los campos.");
                return;
            }

            if (!fechaValida(fechaNueva) || fechaNueva < fechaActual()) {
                alert("Selecciona una fecha válida de hoy o posterior.");
                return;
            }

            const tareas = obtenerTareas();

            tareas.push({
                id: crearId(),
                nombre: nombreNuevo,
                materia: materiaNueva,
                fecha: fechaNueva,
                completada: false
            });

            if (guardar("misTareas", tareas)) {
                formularioTarea.reset();
                fecha.min = fechaActual();
                dibujarTareas();
            }
        });

        filtro.addEventListener("change", dibujarTareas);

        dibujarTareas();
    }

    // ==============================
    // SISTEMA DE HORARIO
    // ==============================

    const formularioHorario = document.getElementById("formulario-horario");

    if (formularioHorario) {
        const actividad = document.getElementById("actividad-horario");
        const dia = document.getElementById("dia-horario");
        const inicio = document.getElementById("hora-inicio");
        const fin = document.getElementById("hora-fin");
        const lista = document.getElementById("lista-horario");

        const ordenDias = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ];

        function obtenerHorario() {
            return leer("miHorario").filter(item =>
                item &&
                typeof item.id === "string" &&
                typeof item.actividad === "string" &&
                ordenDias.includes(item.dia) &&
                typeof item.inicio === "string" &&
                typeof item.fin === "string"
            );
        }

        function dibujarHorario() {
            const horario = obtenerHorario();

            lista.replaceChildren();

            if (horario.length === 0) {
                mostrarMensaje(
                    lista,
                    "Todavía no tienes actividades. Agrega la primera."
                );
                return;
            }

            horario.sort((a, b) => {
                const diferencia = ordenDias.indexOf(a.dia) -
                    ordenDias.indexOf(b.dia);

                return diferencia || a.inicio.localeCompare(b.inicio);
            });

            ordenDias.forEach(nombreDia => {
                const actividades = horario.filter(
                    item => item.dia === nombreDia
                );

                if (actividades.length === 0) {
                    return;
                }

                const grupo = crearElemento("section", "grupo-dia");
                grupo.appendChild(crearElemento("h3", "", nombreDia));

                actividades.forEach(item => {
                    const tarjeta = crearElemento("article", "elemento-lista");
                    const informacion = crearElemento("div", "hora-actividad");

                    informacion.appendChild(
                        crearElemento(
                            "span",
                            "hora",
                            item.inicio + " – " + item.fin
                        )
                    );

                    informacion.appendChild(
                        crearElemento("span", "", item.actividad)
                    );

                    const boton = crearElemento(
                        "button",
                        "boton-pequeno boton-borrar",
                        "🗑 Eliminar"
                    );

                    boton.type = "button";

                    boton.addEventListener("click", () => {
                        if (!confirm("¿Quieres eliminar esta actividad?")) {
                            return;
                        }

                        const actualizado = obtenerHorario().filter(
                            otra => otra.id !== item.id
                        );

                        if (guardar("miHorario", actualizado)) {
                            dibujarHorario();
                        }
                    });

                    tarjeta.append(informacion, boton);
                    grupo.appendChild(tarjeta);
                });

                lista.appendChild(grupo);
            });
        }

        formularioHorario.addEventListener("submit", evento => {
            evento.preventDefault();

            const actividadNueva = actividad.value.trim();
            const diaNuevo = dia.value;
            const inicioNuevo = inicio.value;
            const finNuevo = fin.value;

            if (
                !actividadNueva ||
                !diaNuevo ||
                !inicioNuevo ||
                !finNuevo
            ) {
                alert("Completa todos los campos.");
                return;
            }

            if (finNuevo <= inicioNuevo) {
                alert("La hora de finalización debe ser posterior a la de inicio.");
                return;
            }

            const horario = obtenerHorario();

            const conflicto = horario.some(item =>
                item.dia === diaNuevo &&
                inicioNuevo < item.fin &&
                finNuevo > item.inicio
            );

            if (conflicto) {
                alert("Ese horario se cruza con otra actividad del mismo día.");
                return;
            }

            horario.push({
                id: crearId(),
                actividad: actividadNueva,
                dia: diaNuevo,
                inicio: inicioNuevo,
                fin: finNuevo
            });

            if (guardar("miHorario", horario)) {
                formularioHorario.reset();
                dibujarHorario();
            }
        });

        dibujarHorario();
    }

    // ==============================
    // SISTEMA DE OBJETIVOS
    // ==============================

    const formularioObjetivo = document.getElementById("formulario-objetivo");

    if (formularioObjetivo) {
        const nombre = document.getElementById("nombre-objetivo");
        const fecha = document.getElementById("fecha-objetivo");
        const lista = document.getElementById("lista-objetivos");

        fecha.min = fechaActual();

        function obtenerObjetivos() {
            return leer("misObjetivos").filter(meta =>
                meta &&
                typeof meta.id === "string" &&
                typeof meta.nombre === "string" &&
                typeof meta.fecha === "string" &&
                typeof meta.completada === "boolean"
            );
        }

        function dibujarObjetivos() {
            const objetivos = obtenerObjetivos();

            lista.replaceChildren();

            if (objetivos.length === 0) {
                mostrarMensaje(
                    lista,
                    "Todavía no tienes objetivos. Escribe tu primera meta."
                );
                return;
            }

            objetivos.forEach(meta => {
                const tarjeta = crearElemento(
                    "article",
                    "elemento-lista" + (meta.completada ? " completado" : "")
                );

                const informacion = crearElemento("div");

                informacion.appendChild(
                    crearElemento("h3", "", meta.nombre)
                );

                if (meta.fecha) {
                    informacion.appendChild(
                        crearElemento(
                            "p",
                            "",
                            "Fecha objetivo: " + mostrarFecha(meta.fecha)
                        )
                    );
                } else {
                    informacion.appendChild(
                        crearElemento("p", "", "Sin fecha objetivo")
                    );
                }

                const acciones = crearElemento("div", "acciones-lista");

                const botonCompletar = crearElemento(
                    "button",
                    "boton-pequeno boton-marcar",
                    meta.completada ? "↩ Reabrir" : "✓ Cumplido"
                );

                botonCompletar.type = "button";

                botonCompletar.addEventListener("click", () => {
                    const actualizados = obtenerObjetivos().map(item =>
                        item.id === meta.id
                            ? { ...item, completada: !item.completada }
                            : item
                    );

                    if (guardar("misObjetivos", actualizados)) {
                        dibujarObjetivos();
                    }
                });

                const botonBorrar = crearElemento(
                    "button",
                    "boton-pequeno boton-borrar",
                    "🗑 Eliminar"
                );

                botonBorrar.type = "button";

                botonBorrar.addEventListener("click", () => {
                    if (!confirm("¿Quieres eliminar este objetivo?")) {
                        return;
                    }

                    const actualizados = obtenerObjetivos().filter(
                        item => item.id !== meta.id
                    );

                    if (guardar("misObjetivos", actualizados)) {
                        dibujarObjetivos();
                    }
                });

                acciones.append(botonCompletar, botonBorrar);
                tarjeta.append(informacion, acciones);
                lista.appendChild(tarjeta);
            });
        }

        formularioObjetivo.addEventListener("submit", evento => {
            evento.preventDefault();

            const nombreNuevo = nombre.value.trim();
            const fechaNueva = fecha.value;

            if (!nombreNuevo) {
                alert("Escribe el nombre de tu objetivo.");
                return;
            }

            if (
                fechaNueva &&
                (!fechaValida(fechaNueva) || fechaNueva < fechaActual())
            ) {
                alert("Selecciona una fecha válida de hoy o posterior.");
                return;
            }

            const objetivos = obtenerObjetivos();

            objetivos.push({
                id: crearId(),
                nombre: nombreNuevo,
                fecha: fechaNueva,
                completada: false
            });

            if (guardar("misObjetivos", objetivos)) {
                formularioObjetivo.reset();
                fecha.min = fechaActual();
                dibujarObjetivos();
            }
        });

        dibujarObjetivos();
    }
});