import { withApiError } from "@/lib/http/errors";
import { getApiContext, searchParamsObject } from "@/lib/http/server";
import { userByIdInput, userService } from "@/service/user";

export async function GET(request: Request) {
  return withApiError(async () => {
    const ctx = await getApiContext(request);
    const input = userByIdInput.parse(searchParamsObject(request));
    return Response.json(await userService.getById(ctx, input));
  });
}
