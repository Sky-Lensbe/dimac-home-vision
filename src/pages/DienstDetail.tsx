import { useParams, Navigate } from "react-router-dom";
import { ServicePage } from "@/components/site/ServicePage";
import { getService } from "@/data/services";

const DienstDetail = () => {
  const { slug } = useParams();
  const service = slug ? getService(slug) : undefined;
  if (!service) return <Navigate to="/diensten" replace />;
  return <ServicePage service={service} />;
};

export default DienstDetail;
