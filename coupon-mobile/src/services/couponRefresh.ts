type Listener = () => void;

const listeners = new Set<Listener>();
let pendingRefresh = false;

/** Demande un rechargement de la liste des coupons (FCM reçu / tap notification). */
export function requestCouponRefresh(): void {
  if (listeners.size === 0) {
    pendingRefresh = true;
    return;
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

/** S'abonne aux demandes de refresh. Retourne une fonction de désabonnement. */
export function subscribeCouponRefresh(listener: Listener): () => void {
  listeners.add(listener);
  if (pendingRefresh) {
    pendingRefresh = false;
    try {
      listener();
    } catch {
      // ignore
    }
  }
  return () => {
    listeners.delete(listener);
  };
}
