import { useMemo } from "react";
import type { EquipoDashboard } from "../interfaces/equipos";

interface ChartData {
  name: string;
  value: number;
}

interface EquipoCriticoResumen {
  id: string;
  hostname: string;
  sucursal: string;
  ubicacion: string;
  departamento: string;
  responsable: string;
  estadoFuncionamiento: string;
}

function esEquipoCritico(equipo: EquipoDashboard): boolean {
  return (
    equipo.estadoFuncionamiento === "Malo" ||
    equipo.estadoFuncionamiento === "Disfuncional"
  );
}

function esEquipoBueno(equipo: EquipoDashboard): boolean {
  return (
    equipo.estadoFuncionamiento === "Excelente" ||
    equipo.estadoFuncionamiento === "Bueno"
  );
}

function esEquipoRegular(equipo: EquipoDashboard): boolean {
  return equipo.estadoFuncionamiento === "Regular";
}

function agruparPor(
  equipos: EquipoDashboard[],
  obtenerClave: (equipo: EquipoDashboard) => string
): ChartData[] {
  const conteo = equipos.reduce<Record<string, number>>((acumulador, equipo) => {
    const clave = obtenerClave(equipo) || "Sin clasificar";
    acumulador[clave] = (acumulador[clave] ?? 0) + 1;
    return acumulador;
  }, {});

  return Object.entries(conteo)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function useDashboardStats(equipos: EquipoDashboard[]) {
  return useMemo(() => {
    const totalEquipos = equipos.length;
    const totalActivos = equipos.filter((equipo) => equipo.activo).length;
    const totalInactivos = equipos.filter((equipo) => !equipo.activo).length;
    const totalBuenos = equipos.filter(esEquipoBueno).length;
    const totalRegulares = equipos.filter(esEquipoRegular).length;
    const totalCriticos = equipos.filter(esEquipoCritico).length;

    const sucursalesConInventario = new Set(
      equipos
        .map((equipo) => equipo.sucursal)
        .filter((sucursal) => sucursal && sucursal !== "Sin sucursal")
    ).size;

    const equiposPorEstado: ChartData[] = [
      {
        name: "Excelente",
        value: equipos.filter(
          (equipo) => equipo.estadoFuncionamiento === "Excelente"
        ).length,
      },
      {
        name: "Bueno",
        value: equipos.filter(
          (equipo) => equipo.estadoFuncionamiento === "Bueno"
        ).length,
      },
      {
        name: "Regular",
        value: totalRegulares,
      },
      {
        name: "Malo",
        value: equipos.filter(
          (equipo) => equipo.estadoFuncionamiento === "Malo"
        ).length,
      },
      {
        name: "Disfuncional",
        value: equipos.filter(
          (equipo) => equipo.estadoFuncionamiento === "Disfuncional"
        ).length,
      },
    ];

   const equiposPorSucursal = agruparPor(
        equipos,
        (equipo) => equipo.sucursal
        ).slice(0, 7);

        const activosPorSucursal = agruparPor(
        equipos.filter((equipo) => equipo.activo),
        (equipo) => equipo.sucursal
        ).slice(0, 7);

        const criticosPorSucursal = agruparPor(
        equipos.filter(esEquipoCritico),
        (equipo) => equipo.sucursal
        ).slice(0, 7);

        const regularesPorSucursal = agruparPor(
        equipos.filter(esEquipoRegular),
        (equipo) => equipo.sucursal
        ).slice(0, 7);

        const equiposPorTipo = agruparPor(
        equipos,
        (equipo) => equipo.tipoEquipo
        );

    const equiposCriticos: EquipoCriticoResumen[] = equipos
      .filter(esEquipoCritico)
      .slice(0, 5)
      .map((equipo) => ({
        id: equipo.id,
        hostname: equipo.hostname,
        sucursal: equipo.sucursal,
        ubicacion: equipo.ubicacion,
        departamento: equipo.departamento,
        responsable: equipo.responsable,
        estadoFuncionamiento: equipo.estadoFuncionamiento,
      }));

        return {
      totalEquipos,
      totalActivos,
      totalInactivos,
      totalBuenos,
      totalRegulares,
      totalCriticos,
      sucursalesConInventario,
      equiposPorEstado,
      equiposPorSucursal,
      activosPorSucursal,
      criticosPorSucursal,
      regularesPorSucursal,
      equiposPorTipo,
      equiposCriticos,
    };
  }, [equipos]);
}




