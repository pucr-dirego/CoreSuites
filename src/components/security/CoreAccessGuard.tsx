import type { ReactNode } from "react";
import type { CoreCapability } from "../../interfaces/coreAccess";
import { useCoreAccess } from "../../hooks/useCoreAccess";
import CoreAccessDenied from "./CoreAccessDenied";

type CoreAccessGuardProps = {
  capability: CoreCapability;
  children: ReactNode;
  onBack?: () => void;
};

const CoreAccessGuard = ({
  capability,
  children,
  onBack,
}: CoreAccessGuardProps) => {
  const { capabilities, isLoading } = useCoreAccess();

  if (isLoading) {
    return (
      <CoreAccessDenied
        title="Validando acceso"
        description="Core está comprobando los privilegios de tu sesión."
        onBack={onBack}
      />
    );
  }

  if (!capabilities[capability]) {
    return <CoreAccessDenied onBack={onBack} />;
  }

  return <>{children}</>;
};

export default CoreAccessGuard;
