import { withApiError } from "@/lib/http/errors";
import { getApiContext, readJsonObject } from "@/lib/http/server";
import { updateNameInput, userService } from "@/service/user";

export async function POST(request: Request) {
  return withApiError(async () => {
    const ctx = await getApiContext(request);
    const input = updateNameInput.parse(await readJsonObject(request));
    return Response.json(await userService.updateName(ctx, input));
  });
}
