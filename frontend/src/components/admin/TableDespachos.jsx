import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "./Modal";
import { FormCierreDespacho } from "./FormCierreDespacho";

export const TableDespachos = () => {
  const [despachos, setDespachos] = useState([]);

  const despacho = async () => {
    await axios
      .get("/api/v1/despachos", {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then((response) => {
        console.log("Respuesta del backend (Despachos):", response.data);
        // EL ESCUDO: Verificamos si Nginx/Backend nos devolvió una lista real
        if (Array.isArray(response.data)) {
          setDespachos(response.data);
        } else {
          console.error("Error: El backend no devolvió un Array válido. Recibido:", response.data);
          setDespachos([]); // Evita que explote el .map()
        }
      })
      .catch((error) => {
        console.error("Error de red o del servidor al pedir despachos:", error);
        setDespachos([]); 
      });
  };

  // Llamada a la función para obtener los datos cuando el componente se monta
  useEffect(() => {
    despacho();
  }, []);

  const [openModal, setOpenModal] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);

  const handleAbrirModal = (despachoData) => {
    setDespachoSeleccionado(despachoData);
    setOpenModal(true);
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de despacho</th>
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">Dirección de entrega</th>
                  <th className="pr-10">Fecha despacho</th>
                  <th className="pr-10">Patente Camión</th>
                  <th className="pr-10">Entregado</th>
                  <th className="pr-10">Intentos de entrega</th>
                  <th className="pr-10"></th>
                </tr>
              </thead>
              <tbody>
                {despachos.map((despachoItem) => (
                  <tr key={despachoItem.idDespacho}>
                    <td className="pr-10 py-10 items-center">{despachoItem.idDespacho}</td>
                    <td className="pr-10 py-10 items-center">{despachoItem.idCompra}</td>
                    <td className="pr-10 py-10 items-center">{despachoItem.direccionCompra}</td>
                    <td className="pr-10 py-10 items-center">{despachoItem.fechaDespacho}</td>
                    <td className="pr-10 py-10 items-center">{despachoItem.patenteCamion}</td>
                    <td className="pr-10 py-10 items-center">
                      {despachoItem.entregado
                        ? "Despacho entregado"
                        : "Despacho pendiente"}
                    </td>
                    <td className="pr-10 py-10 items-center">{despachoItem.intento}</td>
                    <td>
                      <button
                        onClick={() => handleAbrirModal(despachoItem)}
                        className="py-1 bg-orange-200 px-8 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300 "
                      >
                        Cerrar despacho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Modal
        onClose={() => {
          setOpenModal(false);
        }}
        open={openModal}
      >
        {despachoSeleccionado && (
          <FormCierreDespacho
            despacho={despachoSeleccionado}
            onClose={() => {
              setOpenModal(false);
              despacho();
            }}
          />
        )}
      </Modal>
    </>
  );
};