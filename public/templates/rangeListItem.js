// rangeListItem.dust
(function(){dust.register("rangeListItem",body_0);function body_0(chk,ctx){return chk.write("<li class=\"collapsed list-group-item\" id=\"").reference(ctx.get("id"),ctx,"h").write("\">").write("\n  ").write("<span class=\"label label-default ").reference(ctx.get("colorClass"),ctx,"h").write("\">&nbsp;</span>").write("\n   ").write("<a class=\"he-code-toggle\" href=\"#\">&nbsp;</a>").write("\n  ").write("<code class=\"he-highlighted-summary\">").reference(ctx.get("summary"),ctx,"h").write("</code>").write("\n  ").write("<span class=\"badge\">").reference(ctx.get("range"),ctx,"h").write("</span>").write("\n  ").write("<pre class=\"he-highlighted-code\"><code>").reference(ctx.get("text"),ctx,"h").write("</code></pre>").write("\n").write("</li>");}return body_0;})();