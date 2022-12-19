import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/layout";
import { CartContext } from "../context/cartContext";
import './checkout.css'


// firebase
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const CheckoutView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState(false);
  const { productsAdded: items, clear, totalAmount } = useContext(CartContext);
  const navigate = useNavigate();

  const getTotalByProduct = (quantity, price) => {
    return quantity * price;
  };

  const handleFinalizePurchase = (event) => {
    event.preventDefault();
    const name = event.target[0].value;
    const phone = event.target[1].value;
    const email = event.target[2].value;

    setIsLoading(true);

    const total = items
      .map((product) =>
        getTotalByProduct(product.quantityAdded, product.item.price)
      )
      .reduce((previousValue, currentValue) => previousValue + currentValue);

    const order = {
      buyer: { name, phone, email },
      items,
      total,
    };
    const db = getFirestore();
    const ordersCollection = collection(db, "orders");

    addDoc(ordersCollection, order)
      .then(() => {
        setUpdatingProducts(true);
      })
      .catch((err) => console.error({ err }))
      .finally(() => {});
  };

  useEffect(() => {
    if (updatingProducts) {
      const db = getFirestore();

      items.forEach((element) => {
        const itemRef = doc(db, "items", element.item.id);
        const dataToUpdate = {
          stock: element.item.stock - element.quantityAdded,
        };
        updateDoc(itemRef, dataToUpdate)
          .then(() => {
            clear();
            setIsLoading(false);
            alert("Compra finalizada" + itemRef);
            navigate("/");
          })
          .catch((err) => console.error(err));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatingProducts]);

  return (
    <Layout>
      <form onSubmit={handleFinalizePurchase} >
        <div className="form-inputs">
          <input
            placeholder="Nombre Completo"
            required
          />
          <input
            placeholder="Numero de Telefono"
            type="number"
            required
          />
          <input
            placeholder="Email"
            type={"email"}
            required
          />
        </div>
        <span>
          Total a pagar: <strong>${totalAmount}</strong>
        </span>
        {items.map((item)=>{
          return(
            <div>
              <p>Cantidad de productos: {item.quantityAdded}</p>
            </div>
          )
        })}
        <button
          type="submit"
          disabled={isLoading}
        >
          Finalizar
        </button>
      </form>
    </Layout>
  );
};

export default CheckoutView;