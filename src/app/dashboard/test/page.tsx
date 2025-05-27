async function getArtist() {
  const res = await fetch("http://localhost:3000/api/profile/profile");
  return res.json();
}

export default async function Test({}: {
  params: Promise<{ username: string }>;
}) {
  const artistData = getArtist();

  // Initiate both requests in parallel
  const [artist] = await Promise.all([artistData]);

  return (
    <>
      <h1>{artist.name}</h1>
    </>
  );
}
