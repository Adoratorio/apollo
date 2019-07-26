const Easings = {
  LINEAR: (t : number) => t,
  OUT_QUAD: (t : number) => t*(2-t),
  OUT_CUBIC: (t : number) => (--t)*t*t+1,
  OUT_QUART: (t : number) => 1-(--t)*t*t*t,
  OUT_QUINT: (t : number) => 1+(--t)*t*t*t*t,
}

export default Easings;