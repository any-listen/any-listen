export const generateId = () => {
  return Math.random().toString(36).slice(3) + Math.random().toString(36).slice(2)
}
