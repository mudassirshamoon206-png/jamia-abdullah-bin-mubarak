const bucket = "markaz-abdullah-bin-mubarak.appspot.com";
const path = "test/dummy.txt";
const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(path)}`;

async function testREST() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: "Hello REST API"
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

testREST();
