// occurenceListItem.dust
(function(){dust.register("occurenceListItem",body_0);function body_0(chk,ctx){return chk.write("<li class=\"collapsed list-group-item\"><a class=\"he-code-toggle\" href=\"#\">&nbsp;</a><code class=\"he-highlighted-summary\">").reference(ctx._get(false, ["summary"]),ctx,"h").write("</code><span class=\"badge ").reference(ctx._get(false, ["colorClass"]),ctx,"h").write("\">").reference(ctx._get(false, ["occurences"]),ctx,"h").write("</span><pre class=\"he-highlighted-code\"><code>").reference(ctx._get(false, ["text"]),ctx,"h").write("</code></pre></li>");}return body_0;})();