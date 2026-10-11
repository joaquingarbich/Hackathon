import { Info, OctagonAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui";

export async function Mensaje({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { error, aviso } = await searchParams;
  if (error) return <Alert role="alert" variant="peligro"><OctagonAlert aria-hidden /><AlertDescription>{String(error)}</AlertDescription></Alert>;
  if (aviso) return <Alert role="status" variant="info"><Info aria-hidden /><AlertDescription>{String(aviso)}</AlertDescription></Alert>;
  return null;
}
