import "../../styles/KPISection.css";

interface CoreSuppliersKPISectionProps {
  totalProveedores: number;
  serviciosActivos: number;
  sucursalesCubiertas: number;
  serviciosSinContacto: number;
  isLoading: boolean;
}

function CoreSuppliersKPISection({
  totalProveedores,
  serviciosActivos,
  sucursalesCubiertas,
  serviciosSinContacto,
  isLoading,
}: CoreSuppliersKPISectionProps) {
  const mostrarValor = (valor: number) => (isLoading ? "..." : valor);

  return (
    <section className="kpi-section">
      <div className="kpi-card kpi-good">
        <span>Proveedores registrados</span>
        <strong>{mostrarValor(totalProveedores)}</strong>
        <p className="kpi-card-detail">Catálogo maestro</p>
      </div>

      <div className="kpi-card kpi-good">
        <span>Servicios activos</span>
        <strong>{mostrarValor(serviciosActivos)}</strong>
        <p className="kpi-card-detail">Internet, CCTV y computadoras</p>
      </div>

      <div className="kpi-card kpi-warning">
        <span>Sucursales cubiertas</span>
        <strong>{mostrarValor(sucursalesCubiertas)}</strong>
        <p className="kpi-card-detail">Con al menos un proveedor asignado</p>
      </div>

      <div className="kpi-card kpi-danger">
        <span>Datos por completar</span>
        <strong>{mostrarValor(serviciosSinContacto)}</strong>
        <p className="kpi-card-detail">Sin teléfono o correo de soporte</p>
      </div>
    </section>
  );
}

export default CoreSuppliersKPISection;

