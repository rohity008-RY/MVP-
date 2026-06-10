export function GET() {
  return Response.json({
    ok: true,
    data: {
      status: "ok",
      app: "admin-web"
    }
  });
}
