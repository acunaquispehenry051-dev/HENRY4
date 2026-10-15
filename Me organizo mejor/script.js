"use strict";

/*
 * ME ORGANIZO MEJOR
 * Funciones de la página principal.
 */

document.addEventListener("DOMContentLoaded", () => {
    const pendientes = document.getElementById("resumen-pendientes");
    const completadas = document.getElementById("resumen-completadas");
    const objetivos = document.getElementById("resumen-objetivos");

    function leerDatos(clave) {
        try {
            const contenido = localStorage.getItem(clave);

            if (!contenido) {
                return [];
            }

            const datos = JSON.parse(contenido);

            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            console.error("No se pudieron leer los datos:", error);
            return [];
        }
    }

    function actualizarResumen() {
        const tareas = leerDatos("misTareas");
        const metas = leerDatos("misObjetivos");

        const totalCompletadas = tareas.filter(
            tarea => tarea && tarea.completada === true
        ).length;

        const totalPendientes = tareas.filter(
            tarea => tarea && tarea.completada !== true
        ).length;

        if (pendientes) {
            pendientes.textContent = totalPendientes;
        }

        if (completadas) {
            completadas.textContent = totalCompletadas;
        }

        if (objetivos) {
            objetivos.textContent = metas.filter(
                meta => meta && meta.completada !== true
            ).length;
        }
    }

    actualizarResumen();
});