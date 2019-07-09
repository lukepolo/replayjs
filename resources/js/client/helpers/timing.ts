export default function() {
  return performance.timing.navigationStart + performance.now();
}
