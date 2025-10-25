// Socket namespaces/emitters can be centralized here later
export const emitGlobal = (app, event, payload) => {
  const io = app.get('io');
  if (io) io.emit(event, payload);
};
