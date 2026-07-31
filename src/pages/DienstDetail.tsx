import { useParams } from "react-router-dom";
import { ServicePage } from "@/components/site/ServicePage";
import NotFound from "@/pages/NotFound";
import { getService } from "@/data/services";

const DienstDetail = () => {
  const { slug } = useParams();
  const service = slug ? getService(slug) : undefined;
  // Onbekende dienstslugs geven een echte niet-gevonden toestand,
  // geen stille doorverwijzing naar het overzicht.
  if (!service) return <NotFound />;
  return <ServicePage service={service} />;
};

export default DienstDetail;
