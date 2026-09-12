type Listener = () => void;

class WellnessEvents {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export default new WellnessEvents();