async function fetchData(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve("async data"), 100);
  });
}

async function main() {
  const result = await fetchData();
  console.log(result);
}

main();
