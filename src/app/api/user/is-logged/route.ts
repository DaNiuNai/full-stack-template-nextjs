import { withApiError } from "@/lib/http/errors";
import { getApiContext } from "@/lib/http/server";
import { userService } from "@/service/user";

export async function GET(request: Request) {
  return withApiError(async () => {
    const ctx = await getApiContext(request);
    return Response.json(await userService.getLoginStatus(ctx));
  });
}
