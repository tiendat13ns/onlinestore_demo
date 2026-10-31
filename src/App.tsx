import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { NotFoundMessage } from './components/StatusMessages';
import About from './pages/About';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Home from './pages/Home';
import { PrivacyPage, ReturnsPage, ShippingPage } from './pages/Policies';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout-demo" element={<Checkout />} />
        <Route path="order-demo/confirmation" element={<Confirmation />} />
        <Route path="orders" element={<Orders />} />
        <Route path="admin" element={<Admin />} />
        <Route path="about" element={<About />} />
        <Route path="policies/shipping" element={<ShippingPage />} />
        <Route path="policies/returns" element={<ReturnsPage />} />
        <Route path="policies/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundMessage />} />
      </Route>
    </Routes>
  );
}
